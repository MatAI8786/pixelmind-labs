import { Node } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export function dragNodeFactory(type: string, x: number, y: number): Node {
  const position = { x, y };
  switch (type) {
    case 'llm':
      return {
        id: uuidv4(),
        type,
        position,
        data: {
          title: 'LLM',
          prompt: '',
          model: 'gpt-3.5-turbo',
          temperature: 1,
          maxTokens: 256,
          provider: 'openai',
        },
      };
    case 'input':
      return {
        id: uuidv4(),
        type,
        position,
        data: { title: 'Input', value: '' },
      };
    case 'output':
      return {
        id: uuidv4(),
        type,
        position,
        data: { title: 'Output' },
      };
    default:
      return {
        id: uuidv4(),
        type,
        position,
        data: { label: type },
      };
  }
}
