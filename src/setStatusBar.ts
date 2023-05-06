import * as vscode from "vscode";
import { DataItem } from "./index.d";

export function setStateBarItem(statusBarContent:vscode.StatusBarItem, context: vscode.ExtensionContext) {
  const index = (context.workspaceState.get("tt-index") as number) || 0;
  const data = (context.workspaceState.get("tt-data") as DataItem[]) || [];

  if (statusBarContent !== undefined) {
    statusBarContent.text = `${data[index].title} ${index + 1}/${
      data.length
    }`;
    statusBarContent.tooltip = data[index].desc;
  }
}
