import * as vscode from 'vscode';
import { fetchListData, fetchContent } from "./fetchData";
import { setStateBarItem } from './setStatusBar';
import getLoaclData from './libs/getLocalData';

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

      const data = await fetchListData();
      context.workspaceState.update("tt-data", data);
      context.workspaceState.update("tt-index", 0);

      setStateBarItem(statusBarContent, context);
    }
  });

  vscode.commands.registerCommand("FishX.next", async () => {
    const { index, data } = getLoaclData(context);
    if (index >= data.length - 1) {
      statusBarContent.text = "正在加载更多内容...";
      const newData = await fetchListData();
      const newDataMap = new Map();
      for (const item of [...data, ...newData]) {
        newDataMap.set(item.title, item);
      }
      context.workspaceState.update("tt-data", [...newDataMap.values()]);
      context.workspaceState.update("tt-index", index + 1);
      setStateBarItem(statusBarContent, context);
      return;
    }
    context.workspaceState.update("tt-index", index + 1);
    if (statusBarContent !== undefined) {
      setStateBarItem(statusBarContent, context);
    }
  });

  vscode.commands.registerCommand("FishX.prev", async () => {
    const { index } = getLoaclData(context);
    if (index <= 0) {
      vscode.window.showInformationMessage("已经是第一条了");
      return;
    }
    context.workspaceState.update("tt-index", index - 1);
    if (statusBarContent !== undefined) {
      setStateBarItem(statusBarContent, context);
    }
  });

  const hoverDisposable = vscode.languages.registerHoverProvider(
    ["typescript", "javascript", "vue"],
    {
      async provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position);
        const word = document.getText(range);
        if (word === "const") {
          const { index, data } = getLoaclData(context);
          const content = await fetchContent(data[index].src);
          return new vscode.Hover(content);
        }
      },
    }
  );
	
	context.subscriptions.push(disposable, hoverDisposable);
}

export function deactivate() {}
