import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: 'provider' | 'vpc' | 'subnet' | 'instance' | 'database' | 'storage';
  provider?: 'AWS' | 'Azure' | 'GCP';
  status: 'healthy' | 'warning' | 'error';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: 'network' | 'data' | 'dependency';
}

const mockTopologyData: { nodes: Node[]; links: Link[] } = {
  nodes: [
    // AWS Cloud
    { id: 'aws', name: 'AWS', type: 'provider', provider: 'AWS', status: 'healthy' },
    { id: 'aws-vpc-1', name: 'Production VPC', type: 'vpc', provider: 'AWS', status: 'healthy' },
    { id: 'aws-subnet-1', name: 'Public Subnet', type: 'subnet', provider: 'AWS', status: 'healthy' },
    { id: 'aws-subnet-2', name: 'Private Subnet', type: 'subnet', provider: 'AWS', status: 'healthy' },
    { id: 'aws-ec2-1', name: 'Web Server', type: 'instance', provider: 'AWS', status: 'healthy' },
    { id: 'aws-ec2-2', name: 'App Server', type: 'instance', provider: 'AWS', status: 'warning' },
    { id: 'aws-rds', name: 'RDS Database', type: 'database', provider: 'AWS', status: 'healthy' },
    { id: 'aws-s3', name: 'S3 Bucket', type: 'storage', provider: 'AWS', status: 'healthy' },

    // Azure Cloud
    { id: 'azure', name: 'Azure', type: 'provider', provider: 'Azure', status: 'healthy' },
    { id: 'azure-vnet', name: 'Virtual Network', type: 'vpc', provider: 'Azure', status: 'healthy' },
    { id: 'azure-subnet-1', name: 'Default Subnet', type: 'subnet', provider: 'Azure', status: 'healthy' },
    { id: 'azure-vm', name: 'VM Instance', type: 'instance', provider: 'Azure', status: 'healthy' },
    { id: 'azure-sql', name: 'SQL Database', type: 'database', provider: 'Azure', status: 'error' },

    // GCP Cloud
    { id: 'gcp', name: 'GCP', type: 'provider', provider: 'GCP', status: 'healthy' },
    { id: 'gcp-vpc', name: 'VPC Network', type: 'vpc', provider: 'GCP', status: 'healthy' },
    { id: 'gcp-compute', name: 'Compute Engine', type: 'instance', provider: 'GCP', status: 'healthy' },
    { id: 'gcp-storage', name: 'Cloud Storage', type: 'storage', provider: 'GCP', status: 'healthy' },
  ],
  links: [
    // AWS connections
    { source: 'aws', target: 'aws-vpc-1', type: 'network' },
    { source: 'aws-vpc-1', target: 'aws-subnet-1', type: 'network' },
    { source: 'aws-vpc-1', target: 'aws-subnet-2', type: 'network' },
    { source: 'aws-subnet-1', target: 'aws-ec2-1', type: 'network' },
    { source: 'aws-subnet-2', target: 'aws-ec2-2', type: 'network' },
    { source: 'aws-subnet-2', target: 'aws-rds', type: 'network' },
    { source: 'aws-ec2-2', target: 'aws-rds', type: 'data' },
    { source: 'aws-ec2-1', target: 'aws-s3', type: 'data' },

    // Azure connections
    { source: 'azure', target: 'azure-vnet', type: 'network' },
    { source: 'azure-vnet', target: 'azure-subnet-1', type: 'network' },
    { source: 'azure-subnet-1', target: 'azure-vm', type: 'network' },
    { source: 'azure-vm', target: 'azure-sql', type: 'data' },

    // GCP connections
    { source: 'gcp', target: 'gcp-vpc', type: 'network' },
    { source: 'gcp-vpc', target: 'gcp-compute', type: 'network' },
    { source: 'gcp-compute', target: 'gcp-storage', type: 'data' },

    // Cross-cloud connections
    { source: 'aws-ec2-1', target: 'azure-vm', type: 'dependency' },
    { source: 'azure-vm', target: 'gcp-compute', type: 'dependency' },
  ],
};

const nodeColors = {
  provider: '#6366f1',
  vpc: '#8b5cf6',
  subnet: '#a78bfa',
  instance: '#10b981',
  database: '#f59e0b',
  storage: '#06b6d4',
};

const statusColors = {
  healthy: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

const linkColors = {
  network: '#4b5563',
  data: '#3b82f6',
  dependency: '#a855f7',
};

export default function TopologyMapPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear existing content
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create simulation
    const simulation = d3
      .forceSimulation(mockTopologyData.nodes as any)
      .force(
        'link',
        d3
          .forceLink(mockTopologyData.links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(mockTopologyData.links)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => linkColors[d.type])
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d: any) => (d.type === 'dependency' ? '5,5' : '0'));

    // Create node groups
    const node = g
      .append('g')
      .selectAll('g')
      .data(mockTopologyData.nodes)
      .enter()
      .append('g')
      .call(
        d3.drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Add circles for nodes
    node
      .append('circle')
      .attr('r', (d: any) => (d.type === 'provider' ? 30 : 20))
      .attr('fill', (d: any) => nodeColors[d.type])
      .attr('stroke', (d: any) => statusColors[d.status])
      .attr('stroke-width', 3);

    // Add labels
    node
      .append('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => (d.type === 'provider' ? 45 : 35))
      .attr('fill', '#e5e7eb')
      .attr('font-size', '12px')
      .attr('font-weight', '500');

    // Add type icons (simplified as text)
    node
      .append('text')
      .text((d: any) => {
        switch (d.type) {
          case 'provider': return '☁';
          case 'vpc': return '🌐';
          case 'subnet': return '📡';
          case 'instance': return '💻';
          case 'database': return '🗄';
          case 'storage': return '📦';
          default: return '•';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', (d: any) => (d.type === 'provider' ? '20px' : '16px'));

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Click outside to deselect
    svg.on('click', () => setSelectedNode(null));

    return () => {
      simulation.stop();
    };
  }, []);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Infrastructure Topology</h3>
          <span className="text-sm text-gray-400">
            {mockTopologyData.nodes.length} nodes • {mockTopologyData.links.length} connections
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-3 py-2 bg-gray-800 rounded-lg text-sm min-w-[70px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#0d1220] border border-gray-800 rounded-lg overflow-hidden relative">
          <svg
            ref={svgRef}
            className="w-full h-[600px] bg-[#050810]"
            style={{ cursor: 'grab' }}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Node Types</h4>
            <div className="space-y-2">
              {Object.entries(nodeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>

            <h4 className="font-semibold mb-3 mt-4">Connection Types</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-0.5 bg-gray-600" />
                <span>Network</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-0.5 bg-blue-500" />
                <span>Data Flow</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-0.5 bg-purple-500" style={{ borderTop: '2px dashed' }} />
                <span>Dependency</span>
              </div>
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode ? (
            <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Selected Node</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="font-medium">{selectedNode.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="font-medium capitalize">{selectedNode.type}</p>
                </div>
                {selectedNode.provider && (
                  <div>
                    <p className="text-gray-400">Provider</p>
                    <p className="font-medium">{selectedNode.provider}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">Status</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: statusColors[selectedNode.status] }}
                    />
                    <p className="font-medium capitalize">{selectedNode.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                Click on a node to view details
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Network Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Providers</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VPCs</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Instances</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Databases</span>
                <span className="font-medium">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
