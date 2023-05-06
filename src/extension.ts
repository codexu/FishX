import * as vscode from 'vscode';
import fetchContent from './fetchContent';
import { DataItem } from "./index.d";

let statusBarContent:vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand("FishX.init", async () => {
    if (statusBarContent === undefined) {
      statusBarContent = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBarContent.text = "加载中...";
      statusBarContent.show();

      const nextButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      nextButton.text = "$(arrow-right)";
      nextButton.tooltip = "下一条";
      nextButton.command = "FishX.next";
      nextButton.show();
      
      const data = await fetchContent();
      context.workspaceState.update("tt-data", data);
      context.workspaceState.update("tt-index", 0);

      statusBarContent.text = data[0].title;
    }
  });

  vscode.commands.registerCommand("FishX.next", async () => {
    const index = context.workspaceState.get("tt-index") as number || 0;
    const data = (context.workspaceState.get("tt-data") as DataItem[]) || [];
    if (index >= data.length - 1) {
      vscode.window.showInformationMessage("已经是最后一条了");
      return;
    }
    context.workspaceState.update("tt-index", index + 1);
    if (statusBarContent !== undefined) {
      statusBarContent.text = data[index].title;
    }
  });
	
	context.subscriptions.push(disposable);
}

export function deactivate() {}
