export interface WebSocketMessage {
  id: string;
  type: "peers" | "offer" | "answer" | "candidate";
  description?: string;
  candidate?: string;
  mid?: string;
  keys?: string[];
}


export interface FileWithMetadata extends File {
  size: number;
  name: string;
}