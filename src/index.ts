import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Uri, ViewColumn, TextEditorSelectionChangeKind, Range, ExtensionContext, Position, window, commands,  } from "vscode";
import JsonToTS from 'json-to-ts'
import * as copyPaste from 'copy-paste'
import { handleError, getClipboardText, pasteToMarker, getSelectedText, getViewColumn, validateLength, logEvent, getUserId } from "./lib";
import * as UniversalAnalytics from 'universal-analytics'
import { parseTypescript } from "./builder/builder-ts";

const UA: UniversalAnalytics = require('universal-analytics')
const visitor = UA('UA-97872528-2', getUserId())

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('tsInterfaceToBuilder.fromSelection', transformFromSelection));
  context.subscriptions.push(commands.registerCommand('tsInterfaceToBuilder.fromClipboard', transformFromClipboard));
}

function transformFromSelection () {
  const tmpFilePath = path.join(os.tmpdir(), 'ts-builder.ts');
  const tmpFileUri = Uri.file(tmpFilePath);

  getSelectedText()
    .then(logEvent(visitor, 'Selection'))
    .then(validateLength)
    .then(parseTypescript)
    .then(interfaces => {
      fs.writeFileSync(tmpFilePath, interfaces);    
    })
    .then(() => {
      commands.executeCommand('vscode.open', tmpFileUri, getViewColumn())
    })
    .catch(handleError)

}

function transformFromClipboard () {

  getClipboardText()
    .then(logEvent(visitor, 'Clipboard'))
    .then(validateLength)
    .then(parseTypescript)
    .then(interfaces => {
      pasteToMarker(interfaces)
    })
    .catch(handleError)

}