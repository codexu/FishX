import * as vscode from "vscode";
import { DataItem } from "../index.d";

export default function getLoaclData(context: vscode.ExtensionContext) {
  const index = (context.workspaceState.get("tt-index") as number) || 0;
  const data = (context.workspaceState.get("tt-data") as DataItem[]) || [];

  return { index, data };
}
