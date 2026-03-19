import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

/**
 * Create and show the Copilot Compose status bar item.
 */
export function createStatusBarItem(): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'copilot-compose.check';
  setIdle();
  statusBarItem.show();
  return statusBarItem;
}

export function setSyncing(): void {
  if (!statusBarItem) {return;}
  statusBarItem.text = '$(sync~spin) Copilot Compose';
  statusBarItem.tooltip = 'Syncing instructions...';
}

export function setInSync(): void {
  if (!statusBarItem) {return;}
  statusBarItem.text = '$(check) Copilot Compose';
  statusBarItem.tooltip = 'Instructions are in sync';
}

export function setOutOfDate(): void {
  if (!statusBarItem) {return;}
  statusBarItem.text = '$(warning) Copilot Compose';
  statusBarItem.tooltip = 'Instructions are out of date — click to check';
}

export function setIdle(): void {
  if (!statusBarItem) {return;}
  statusBarItem.text = '$(book) Copilot Compose';
  statusBarItem.tooltip = 'Copilot Compose — click to check sync status';
}

export function setError(): void {
  if (!statusBarItem) {return;}
  statusBarItem.text = '$(error) Copilot Compose';
  statusBarItem.tooltip = 'Error checking sync status';
}

export function disposeStatusBar(): void {
  statusBarItem?.dispose();
  statusBarItem = undefined;
}
