import { Handle, NodeProps, Position } from 'reactflow';

export interface LLMNodeData {
  title: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  provider?: string;
}

export default function LLMNode({ data }: NodeProps<LLMNodeData>) {
  return (
    <div className="bg-white border rounded shadow-sm px-2 py-1 text-sm">
      <div className="font-bold text-center">{data.title || 'LLM'}</div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
