// import { useState } from "react"
// import { useParams } from "react-router-dom"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent } from "@/components/ui/card"
// import {
//   Download,
//   ExternalLink,
//   FileText,
//   RefreshCw,
//   ChevronRight,
//   GitBranch,
//   Users,
//   Layers,
//   Activity,
//   ArrowRightLeft,
//   Box,
//   LayoutTemplate,
//   X,
// } from "lucide-react"
// import { BackToProjectButton } from "@/components/BackToProjectButton"

// // ─── Template Definitions ─────────────────────────────────────────────────────

// interface DiagramTemplate {
//   id: string
//   name: string
//   description: string
//   category: string
//   icon: React.ReactNode
//   xml: string
// }

// const TEMPLATES: DiagramTemplate[] = [
//   {
//     id: "blank",
//     name: "Blank diagram",
//     description: "Start from scratch with an empty canvas.",
//     category: "General",
//     icon: <FileText className="h-5 w-5" />,
//     xml: `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>`,
//   },
//   {
//     id: "use-case",
//     name: "Use case diagram",
//     description: "Actors, system boundary, and use case relationships.",
//     category: "Requirements",
//     icon: <Users className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="System" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.lean_mapping.electronic_info_flow_edge;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#000000;verticalLabelPosition=top;verticalAlign=bottom;labelPosition=center;align=center;fontSize=14;" vertex="1" parent="1">
//       <mxGeometry x="200" y="100" width="500" height="400" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="&lt;b&gt;Actor&lt;/b&gt;" style="shape=mxgraph.uml.actor;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="80" y="220" width="60" height="80" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="Use Case 1" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="280" y="160" width="160" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="Use Case 2" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="280" y="280" width="160" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="Use Case 3" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="460" y="220" width="160" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" style="edgeStyle=none;" edge="1" source="3" target="4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="8" style="edgeStyle=none;" edge="1" source="3" target="5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="9" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="edgeStyle=none;dashed=1;" edge="1" source="5" target="6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "state",
//     name: "State diagram",
//     description: "States, transitions, and guards for entity lifecycle.",
//     category: "Requirements",
//     icon: <Activity className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="" style="ellipse;aspect=fixed;fillColor=#000000;" vertex="1" parent="1">
//       <mxGeometry x="240" y="60" width="30" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="Initial State" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;" vertex="1" parent="1">
//       <mxGeometry x="200" y="140" width="120" height="50" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="Active" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;" vertex="1" parent="1">
//       <mxGeometry x="200" y="250" width="120" height="50" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="Finished" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;" vertex="1" parent="1">
//       <mxGeometry x="380" y="250" width="120" height="50" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="Deactivated" style="rounded=1;whiteSpace=wrap;html=1;arcSize=50;" vertex="1" parent="1">
//       <mxGeometry x="200" y="360" width="120" height="50" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" value="" style="ellipse;aspect=fixed;fillColor=#000000;strokeColor=#ffffff;" vertex="1" parent="1">
//       <mxGeometry x="245" y="470" width="30" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="8" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="2" target="3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="9" value="create" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="3" target="4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="10" value="finish" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="4" target="5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="11" value="disable" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="4" target="6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="12" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="6" target="7" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "sequence",
//     name: "Sequence diagram",
//     description: "Interactions between actors over time.",
//     category: "Requirements",
//     icon: <ArrowRightLeft className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="User" style="shape=umlLifeline;perimeter=mxPerimeter.rectanglePerimeter;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="100" y="40" width="100" height="300" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="System" style="shape=umlLifeline;perimeter=mxPerimeter.rectanglePerimeter;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="320" y="40" width="100" height="300" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="Database" style="shape=umlLifeline;perimeter=mxPerimeter.rectanglePerimeter;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="540" y="40" width="100" height="300" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="request()" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.25;exitDx=0;exitDy=0;entryX=0;entryY=0.25;entryDx=0;entryDy=0;" edge="1" source="2" target="3" parent="1">
//       <mxGeometry relative="1" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="query()" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.4;exitDx=0;exitDy=0;entryX=0;entryY=0.4;entryDx=0;entryDy=0;" edge="1" source="3" target="4" parent="1">
//       <mxGeometry relative="1" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" value="result" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;exitX=0;exitY=0.55;exitDx=0;exitDy=0;entryX=1;entryY=0.55;entryDx=0;entryDy=0;" edge="1" source="4" target="3" parent="1">
//       <mxGeometry relative="1" as="geometry"/>
//     </mxCell>
//     <mxCell id="8" value="response" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;exitX=0;exitY=0.7;exitDx=0;exitDy=0;entryX=1;entryY=0.7;entryDx=0;entryDy=0;" edge="1" source="3" target="2" parent="1">
//       <mxGeometry relative="1" as="geometry"/>
//     </mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "class",
//     name: "Class diagram",
//     description: "Entities, attributes, and relationships between classes.",
//     category: "Requirements",
//     icon: <Box className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="Project" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
//       <mxGeometry x="100" y="100" width="200" height="120" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="2">
//       <mxGeometry y="30" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="+ id: Long" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="3">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
//       <mxGeometry y="60" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="+ name: String" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="5">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
//       <mxGeometry y="90" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="8" value="+ state: ProjectState" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="7">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="9" value="Functionality" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
//       <mxGeometry x="400" y="100" width="200" height="120" as="geometry"/>
//     </mxCell>
//     <mxCell id="10" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="9">
//       <mxGeometry y="30" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="11" value="+ id: Long" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="10">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="12" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="9">
//       <mxGeometry y="60" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="13" value="+ name: String" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="12">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="14" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="9">
//       <mxGeometry y="90" width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="15" value="+ requirements: List" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=0;overflow=hidden;" vertex="1" parent="14">
//       <mxGeometry width="200" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="16" value="" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="2" target="9" parent="1">
//       <mxGeometry relative="1" as="geometry"/>
//     </mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "activity",
//     name: "Activity diagram",
//     description: "Flow of activities and decision points in a process.",
//     category: "Requirements",
//     icon: <GitBranch className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="" style="ellipse;aspect=fixed;fillColor=#000000;" vertex="1" parent="1">
//       <mxGeometry x="235" y="40" width="30" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="Start Process" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="190" y="110" width="120" height="40" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="Validate Input" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="190" y="200" width="120" height="40" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="Valid?" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="200" y="290" width="100" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="Process Request" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="190" y="400" width="120" height="40" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" value="Show Error" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="370" y="290" width="120" height="40" as="geometry"/>
//     </mxCell>
//     <mxCell id="8" value="Return Result" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="190" y="490" width="120" height="40" as="geometry"/>
//     </mxCell>
//     <mxCell id="9" value="" style="ellipse;aspect=fixed;fillColor=#000000;strokeColor=#ffffff;" vertex="1" parent="1">
//       <mxGeometry x="235" y="580" width="30" height="30" as="geometry"/>
//     </mxCell>
//     <mxCell id="10" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="2" target="3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="11" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="3" target="4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="12" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="4" target="5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="13" value="yes" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="5" target="6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="14" value="no" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="5" target="7" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="15" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="6" target="8" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="16" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="8" target="9" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "context",
//     name: "Context diagram",
//     description: "System boundary and external entity interactions.",
//     category: "Requirements",
//     icon: <Layers className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="System" style="ellipse;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
//       <mxGeometry x="300" y="250" width="200" height="100" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="User" style="shape=mxgraph.uml.actor;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="80" y="260" width="60" height="80" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="Admin" style="shape=mxgraph.uml.actor;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="660" y="260" width="60" height="80" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="External API" style="shape=mxgraph.general.cloud;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="300" y="60" width="200" height="100" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="Database" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="340" y="430" width="120" height="80" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" value="requests" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="3" target="2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="8" value="manages" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="4" target="2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="9" value="calls" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="2" target="5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="10" value="reads / writes" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="2" target="6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//   </root>
// </mxGraphModel>`,
//   },
//   {
//     id: "component",
//     name: "Component diagram",
//     description: "Software components and their dependencies.",
//     category: "Architecture",
//     icon: <LayoutTemplate className="h-5 w-5" />,
//     xml: `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10">
//   <root>
//     <mxCell id="0"/><mxCell id="1" parent="0"/>
//     <mxCell id="2" value="«component»&#xa;Frontend" style="shape=mxgraph.uml.component;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="80" y="200" width="140" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="3" value="«component»&#xa;API Gateway" style="shape=mxgraph.uml.component;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="300" y="200" width="140" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="4" value="«component»&#xa;Auth Service" style="shape=mxgraph.uml.component;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="520" y="100" width="140" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="5" value="«component»&#xa;Project Service" style="shape=mxgraph.uml.component;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="520" y="220" width="140" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="6" value="«component»&#xa;Database" style="shape=mxgraph.uml.component;whiteSpace=wrap;html=1;" vertex="1" parent="1">
//       <mxGeometry x="740" y="220" width="140" height="60" as="geometry"/>
//     </mxCell>
//     <mxCell id="7" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="2" target="3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="8" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="3" target="4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="9" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="3" target="5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//     <mxCell id="10" style="edgeStyle=orthogonalEdgeStyle;" edge="1" source="5" target="6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
//   </root>
// </mxGraphModel>`,
//   },
// ]

// const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

// // ─── Main Component ───────────────────────────────────────────────────────────

// function buildEmbedUrl(xml: string): string {
//   // embed.diagrams.net with the XML encoded as a data URI via the ?url= param.
//   // This loads the full editable draw.io editor pre-populated with our XML,
//   // with no postMessage handshake required.
//   const dataUri = `data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`
//   const params = new URLSearchParams({
//     embed: "1",
//     spin: "1",
//     noSaveBtn: "1",
//     noExitBtn: "1",
//     ui: "min",
//     url: dataUri,
//   })
//   return `${DRAWIO_URL}?${params.toString()}`
// }

// function DiagramsView() {
//   const { projectId } = useParams<{ projectId: string }>()

//   const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate | null>(null)
//   const [iframeLoaded, setIframeLoaded] = useState(false)
//   const [filterCategory, setFilterCategory] = useState("All")
//   const [diagramName, setDiagramName] = useState("diagram")

//   const filteredTemplates = TEMPLATES.filter(
//     (t) => filterCategory === "All" || t.category === filterCategory
//   )

//   // ── Actions ───────────────────────────────────────────────────────────────

//   function triggerDownload() {
//     const xml = selectedTemplate?.xml ?? ""
//     const blob = new Blob([xml], { type: "application/xml" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `${diagramName}.drawio`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   function openInDrawio() {
//     const xml = selectedTemplate?.xml ?? ""
//     const encoded = encodeURIComponent(xml)
//     window.open(
//       `https://app.diagrams.net/?title=${encodeURIComponent(diagramName)}&xml=${encoded}`,
//       "_blank"
//     )
//   }

//   function handleLaunch(template: DiagramTemplate) {
//     setIframeLoaded(false)
//     setSelectedTemplate(template)
//     setDiagramName(template.name.toLowerCase().replace(/\s+/g, "-"))
//   }

//   function handleClose() {
//     setSelectedTemplate(null)
//     setIframeLoaded(false)
//   }

//   // ── Render ────────────────────────────────────────────────────────────────

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
//       <BackToProjectButton className="mb-0" projectId={projectId!} />

//       {/* Header */}
//       <header className="flex items-start justify-between gap-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900">Diagrams</h1>
//           <p className="text-slate-500 mt-1">
//             Create requirement engineering diagrams and export them as{" "}
//             <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">.drawio</code>{" "}
//             files. Diagrams are not saved — download to keep them.
//           </p>
//         </div>
//         {selectedTemplate && (
//           <div className="flex items-center gap-2 shrink-0">
//             <input
//               value={diagramName}
//               onChange={(e) => setDiagramName(e.target.value)}
//               className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
//               placeholder="diagram-name"
//             />
//             <Button size="sm" variant="outline" onClick={openInDrawio} title="Open full draw.io app">
//               <ExternalLink className="h-4 w-4 mr-1.5" />
//               Open in draw.io
//             </Button>
//             <Button size="sm" onClick={triggerDownload}>
//               <Download className="h-4 w-4 mr-1.5" />
//               Download .drawio
//             </Button>
//             <Button size="sm" variant="ghost" onClick={handleClose}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         )}
//       </header>

//       {/* Template picker — shown when no template is active */}
//       {!selectedTemplate && (
//         <>
//           {/* Category filter */}
//           <div className="flex flex-wrap gap-2">
//             {CATEGORIES.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setFilterCategory(cat)}
//                 className={[
//                   "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
//                   filterCategory === cat
//                     ? "border-primary bg-primary/5 text-primary"
//                     : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
//                 ].join(" ")}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>

//           {/* Template grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {filteredTemplates.map((template) => (
//               <button
//                 key={template.id}
//                 onClick={() => handleLaunch(template)}
//                 className="group text-left"
//               >
//                 <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md hover:shadow-primary/5 group-hover:-translate-y-0.5">
//                   <CardContent className="p-5 flex flex-col gap-3">
//                     <div className="flex items-start justify-between">
//                       <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
//                         {template.icon}
//                       </div>
//                       <Badge variant="outline" className="text-[10px] font-medium text-slate-400">
//                         {template.category}
//                       </Badge>
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-semibold text-sm text-slate-800">{template.name}</p>
//                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">{template.description}</p>
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
//                       Open in editor <ChevronRight className="h-3.5 w-3.5" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </button>
//             ))}
//           </div>

//           {/* Info banner */}
//           <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
//             <RefreshCw className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
//             <p>
//               Diagrams open in an embedded draw.io editor. Nothing is stored on this server — use the{" "}
//               <span className="font-medium text-slate-700">Download .drawio</span> button to save your
//               work locally. You can also open draw.io in a full tab for advanced features.
//             </p>
//           </div>
//         </>
//       )}

//       {/* Editor — shown once a template is selected */}
//       {selectedTemplate && (
//         <div className="space-y-3">
//           {/* Template switcher strip */}
//           <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
//             <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 shrink-0 mr-1">
//               Switch template
//             </span>
//             {TEMPLATES.map((t) => (
//               <button
//                 key={t.id}
//                 onClick={() => handleLaunch(t)}
//                 className={[
//                   "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0",
//                   selectedTemplate.id === t.id
//                     ? "border-primary bg-primary/5 text-primary"
//                     : "border-slate-200 bg-white text-slate-500 hover:border-primary/40",
//                 ].join(" ")}
//               >
//                 {t.name}
//               </button>
//             ))}
//           </div>

//           {/* Editor frame */}
//           <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50" style={{ height: "75vh" }}>
//             {!iframeLoaded && (
//               <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 z-10">
//                 <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
//                 <p className="text-sm text-slate-500">Loading draw.io editor…</p>
//               </div>
//             )}
//             <iframe
//               key={selectedTemplate.id}
//               src={buildEmbedUrl(selectedTemplate.xml)}
//               className="w-full h-full border-0"
//               title={`draw.io – ${selectedTemplate.name}`}
//               allow="clipboard-read; clipboard-write"
//               onLoad={() => setIframeLoaded(true)}
//             />
//           </div>

//           {/* Footer hint */}
//           <p className="text-xs text-slate-400 text-center">
//             Use the draw.io toolbar to edit · click{" "}
//             <span className="font-medium text-slate-600">Download .drawio</span> above to save locally · no data is sent to this server
//           </p>
//         </div>
//       )}
//     </div>
//   )
// }

// export default DiagramsView