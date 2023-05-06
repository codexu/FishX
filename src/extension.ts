import * as vscode from 'vscode';
import fetchContent from './fetchContent';
import { DataItem } from "./index.d";
import { setStateBarItem } from './setStatusBar';

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

      const prevButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      prevButton.text = "$(arrow-left)";
      prevButton.tooltip = "上一条";
      prevButton.command = "FishX.prev";
      prevButton.show();

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

      setStateBarItem(statusBarContent, context);
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
      setStateBarItem(statusBarContent, context);
    }
  });

  vscode.commands.registerCommand("FishX.prev", async () => {
    const index = context.workspaceState.get("tt-index") as number || 0;
    if (index <= 0) {
      vscode.window.showInformationMessage("已经是第一条了");
      return;
    }
    context.workspaceState.update("tt-index", index - 1);
    if (statusBarContent !== undefined) {
      setStateBarItem(statusBarContent, context);
    }
  });
	
	context.subscriptions.push(disposable);
}

export function deactivate() {}
