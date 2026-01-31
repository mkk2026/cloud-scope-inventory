import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CloudResource } from '../types';

interface TopologyGraphProps {
  resources: CloudResource[];
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ resources }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || resources.length === 0) return;

    // Reset
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = 500;

    // Create a simplified hierarchy for visualization
    // Root -> Providers -> Regions -> Resource Types -> Nodes
    const root = {
      id: "cloud-root",
      name: "Cloud Infrastructure",
      type: "Root",
      children: [] as any[]
    };

    const providers = ['AWS', 'Azure', 'GCP'];
    providers.forEach(p => {
      const pNode = { id: p, name: p, type: "Provider", children: [] as any[] };
      root.children.push(pNode);
      
      const pResources = resources.filter(r => r.provider === p);
      const types = Array.from(new Set(pResources.map(r => r.type)));
      
      types.forEach(t => {
        const tNode = { id: `${p}-${t}`, name: t, type: "Type", children: [] as any[] };
        pNode.children.push(tNode);
        
        // Add up to 5 actual resources per type to keep graph readable
        pResources.filter(r => r.type === t).slice(0, 5).forEach(r => {
          tNode.children.push({
            id: r.id,
            name: r.name,
            type: "Resource",
            value: r.costPerMonth
          });
        });
      });
    });

    const hierarchy = d3.hierarchy(root);
    
    // Circle Packing Layout
    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const rootNode = pack(hierarchy.sum(d => d.value ? d.value + 10 : 1)); // Weight by cost

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("display", "block")
      .style("background", "white")
      .style("cursor", "pointer");

    const color = d3.scaleOrdinal()
      .domain(["Root", "Provider", "Type", "Resource"])
      .range(["transparent", "#f1f5f9", "#e2e8f0", "#cbd5e1"]);

    const node = svg.selectAll("g")
      .data(rootNode.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => {
          if (d.data.name === 'AWS') return '#fff7ed';
          if (d.data.name === 'Azure') return '#eff6ff';
          if (d.data.name === 'GCP') return '#f0fdf4';
          if (d.depth === 3) return '#fff'; // Resource
          return color(d.depth.toString()) as string;
      })
      .attr("stroke", d => {
          if (d.depth === 1 && d.data.name === 'AWS') return '#f59e0b';
          if (d.depth === 1 && d.data.name === 'Azure') return '#3b82f6';
          if (d.depth === 1 && d.data.name === 'GCP') return '#10b981';
          return "#94a3b8";
      })
      .attr("stroke-width", d => d.depth === 1 ? 2 : 1)
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function(event, d) { 
          d3.select(this).attr("stroke", d.depth === 1 ? 
              (d.data.name === 'AWS' ? '#f59e0b' : d.data.name === 'Azure' ? '#3b82f6' : '#10b981') 
              : "#94a3b8"
          ); 
      });

    node.filter(d => (d.depth === 1 || d.depth === 2) && d.r > 20)
      .append("text")
      .attr("dy", d => d.depth === 1 ? -d.r + 20 : 0)
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .style("font-size", d => d.depth === 1 ? "14px" : "10px")
      .style("font-weight", "bold")
      .style("fill", "#475569")
      .style("pointer-events", "none");
    
    // Add title
    node.append("title")
      .text(d => `${d.data.name}\n${d.data.type}\n${d.data.value ? '$' + d.data.value + '/mo' : ''}`);

  }, [resources]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Infrastructure Topology (Circle Pack)</h3>
      <div ref={containerRef} className="w-full h-[500px] overflow-hidden">
        <svg ref={svgRef}></svg>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">Visualizes resource grouping by Provider and Type. Size represents cost.</p>
    </div>
  );
};

export default TopologyGraph;
