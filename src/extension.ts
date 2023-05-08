import * as vscode from 'vscode';
import { fetchListData, fetchContent } from "./libs/fetchData";
import { setStateBarItem } from './libs/setStatusBar';
import getLoaclData from './libs/getLocalData';

let statusBarContent: vscode.StatusBarItem;
let quickPick: vscode.QuickPick<vscode.QuickPickItem>;

export async function activate(context: vscode.ExtensionContext) {

	const initDisposable = vscode.commands.registerCommand(
    "FishX.init",
    async () => {
      if (statusBarContent === undefined) {
        statusBarContent = vscode.window.createStatusBarItem(
          vscode.StatusBarAlignment.Right,
          100
        );
        statusBarContent.text = "加载中...";
        statusBarContent.command = "FishX.quickPick";
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
    }
  );

  const quickPickDisposable = vscode.commands.registerCommand(
    "FishX.quickPick",
    async () => {
      const { data, index } = getLoaclData(context);
      if (quickPick === undefined) {
        quickPick = vscode.window.createQuickPick();
      }
      quickPick.items = data.map((item) => ({ label: item.desc || item.title }));
      quickPick.onDidChangeSelection(async (selection) => {
        if (selection[0]) {
          const index = data.findIndex(
            (item) => item.desc === selection[0].label
          );
          context.workspaceState.update("tt-index", index);
          if (statusBarContent !== undefined) {
            setStateBarItem(statusBarContent, context);
          }
        }
        quickPick.hide();
      });
      quickPick.activeItems = [quickPick.items[index || 0]];
      quickPick.show();
    }
  );

  const nextDisposable = vscode.commands.registerCommand(
    "FishX.next",
    async () => {
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
    }
  );

  const prevDisposable = vscode.commands.registerCommand("FishX.prev", async () => {
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
          return new vscode.Hover(content, range);
        }
      },
    }
  );
	
	context.subscriptions.push(
    initDisposable,
    quickPickDisposable,
    nextDisposable,
    prevDisposable,
    hoverDisposable,
  );
}

export function deactivate() {}
