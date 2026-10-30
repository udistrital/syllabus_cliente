import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  MAX_RICH_TEXT_LENGTH,
  htmlToText,
  normalizeRichTextValue,
  sanitizeRichText,
  toEditorHtml
} from '../../@core/utils/html-editor.utils';

type AlignValue = 'left' | 'center' | 'right' | 'justify';

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  alignJustify: boolean;
}

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements AfterViewInit, ControlValueAccessor, OnDestroy {
  @Input() placeholder = '';
  @Input() maxLength = MAX_RICH_TEXT_LENGTH;

  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  isDisabled = false;
  isEmpty = true;
  length = 0;
  inTable = false;
  activeFormats: ActiveFormats = {
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false
  };

  private pendingValue = '';
  private savedRange: Range | null = null;
  private selectionListener: (() => void) | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.applyPendingValue();
    try {
      document.execCommand('styleWithCSS', false, 'false');
    } catch {
      // Navegadores sin soporte: se mantiene el formato por etiquetas.
    }

    this.selectionListener = () => {
      this.zone.run(() => {
        this.saveSelection();
        this.refreshState();
      });
    };
    document.addEventListener('selectionchange', this.selectionListener);
  }

  ngOnDestroy(): void {
    if (this.selectionListener) {
      document.removeEventListener('selectionchange', this.selectionListener);
      this.selectionListener = null;
    }
  }

  writeValue(value: string | null): void {
    this.pendingValue = value ?? '';
    if (this.editorRef) {
      this.applyPendingValue();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  preventSelectionLoss(event: MouseEvent): void {
    event.preventDefault();
  }

  onInput(): void {
    this.refreshState();
    this.onChange(this.editorRef.nativeElement.innerHTML);
  }

  onBlur(): void {
    const editor = this.editorRef.nativeElement;
    const normalized = normalizeRichTextValue(editor.innerHTML);

    if (normalized !== editor.innerHTML) {
      editor.innerHTML = normalized;
    }

    this.refreshState();
    this.onChange(normalized);
    this.onTouched();
  }

  onSelectionChange(): void {
    this.saveSelection();
    this.refreshState();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const html = event.clipboardData?.getData('text/html') ?? '';
    const text = event.clipboardData?.getData('text/plain') ?? '';

    if (html) {
      document.execCommand('insertHTML', false, sanitizeRichText(html));
    } else if (text) {
      document.execCommand('insertText', false, text);
    }

    this.afterCommand();
  }

  exec(command: string): void {
    if (this.isDisabled) {
      return;
    }
    this.restoreSelection();
    document.execCommand(command, false);
    this.afterCommand();
  }

  align(value: AlignValue): void {
    if (this.isDisabled) {
      return;
    }

    this.restoreSelection();
    const command = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    }[value];

    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(command, false);
    } finally {
      try {
        document.execCommand('styleWithCSS', false, 'false');
      } catch {
        // sin soporte
      }
    }

    const block = this.closestBlock();
    if (block) {
      block.style.textAlign = value;
    }

    this.afterCommand();
  }

  clearFormat(): void {
    if (this.isDisabled) {
      return;
    }

    this.restoreSelection();
    document.execCommand('removeFormat', false);

    const block = this.closestBlock();
    if (block) {
      block.style.removeProperty('text-align');
      block.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
        element.style.removeProperty('text-align');
      });
    }

    this.afterCommand();
  }

  async insertTable(): Promise<void> {
    if (this.isDisabled) {
      return;
    }

    const result = await Swal.fire({
      title: 'Insertar tabla',
      html:
        '<input id="rt-rows" type="number" min="1" max="10" value="3" class="swal2-input" placeholder="Filas">' +
        '<input id="rt-cols" type="number" min="1" max="10" value="3" class="swal2-input" placeholder="Columnas">',
      showCancelButton: true,
      confirmButtonText: 'Insertar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const rowsInput = document.getElementById('rt-rows') as HTMLInputElement | null;
        const colsInput = document.getElementById('rt-cols') as HTMLInputElement | null;
        const rows = Number(rowsInput?.value ?? 0);
        const cols = Number(colsInput?.value ?? 0);

        if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || rows > 10 || cols < 1 || cols > 10) {
          Swal.showValidationMessage('Indica entre 1 y 10 filas y columnas.');
          return false;
        }

        return { rows, cols };
      }
    });

    const value = result.value as { rows: number; cols: number } | undefined;
    if (!result.isConfirmed || !value) {
      return;
    }

    this.restoreSelection();
    this.insertTableNode(value.rows, value.cols);
    this.afterCommand();
  }

  addRow(): void {
    const row = this.currentRow();
    if (!row) {
      return;
    }

    const newRow = document.createElement('tr');
    Array.from(row.cells).forEach((cell) => {
      const newCell = document.createElement(cell.tagName === 'TH' ? 'th' : 'td');
      newCell.appendChild(document.createElement('br'));
      newRow.appendChild(newCell);
    });

    row.parentElement?.insertBefore(newRow, row.nextSibling);
    this.focusCell(newRow.cells.item(0) ?? undefined);
    this.afterCommand();
  }

  removeRow(): void {
    const row = this.currentRow();
    const table = row?.closest('table');
    if (!row || !table || table.rows.length <= 1) {
      return;
    }

    const neighbour = (row.nextElementSibling ?? row.previousElementSibling) as HTMLTableRowElement | null;
    row.parentElement?.removeChild(row);

    if (neighbour) {
      this.focusCell(neighbour.cells.item(0) ?? undefined);
    } else {
      this.focusEditorEnd();
    }
    this.afterCommand();
  }

  addColumn(): void {
    const cell = this.currentCell();
    const table = cell?.closest('table');
    if (!cell || !table) {
      return;
    }

    const index = cell.cellIndex;
    Array.from(table.rows).forEach((row) => {
      const reference = row.cells.item(index);
      const newCell = document.createElement(reference?.tagName === 'TH' ? 'th' : 'td');
      newCell.appendChild(document.createElement('br'));
      row.insertBefore(newCell, reference ? reference.nextSibling : null);
    });

    this.afterCommand();
  }

  removeColumn(): void {
    const cell = this.currentCell();
    const table = cell?.closest('table');
    if (!cell || !table) {
      return;
    }

    const index = cell.cellIndex;
    const rows = Array.from(table.rows);
    if (rows.some((row) => row.cells.length <= 1)) {
      return;
    }

    rows.forEach((row) => {
      const target = row.cells.item(index);
      if (target) {
        row.removeChild(target);
      }
    });

    this.focusEditorEnd();
    this.afterCommand();
  }

  deleteTable(): void {
    const cell = this.currentCell();
    const table = cell?.closest('table');
    if (!table) {
      return;
    }

    table.parentElement?.removeChild(table);
    this.focusEditorEnd();
    this.afterCommand();
  }

  private applyPendingValue(): void {
    const editor = this.editorRef.nativeElement;
    const html = toEditorHtml(this.pendingValue);
    const display = htmlToText(html) ? html : '';

    if (editor.innerHTML === display) {
      this.refreshState();
      return;
    }

    editor.innerHTML = display;
    this.refreshState();
  }

  private refreshState(): void {
    const html = this.editorRef?.nativeElement?.innerHTML ?? '';
    this.length = html.length;
    this.isEmpty = !htmlToText(html);
    this.inTable = this.currentCell() !== null;
    this.refreshActiveFormats();
  }

  private refreshActiveFormats(): void {
    const editor = this.editorRef?.nativeElement;
    const selection = window.getSelection();
    const insideEditor = !!editor && !!selection && selection.rangeCount > 0 &&
      !!selection.anchorNode && editor.contains(selection.anchorNode);

    if (!insideEditor) {
      this.activeFormats = {
        bold: false,
        italic: false,
        underline: false,
        unorderedList: false,
        orderedList: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false
      };
      return;
    }

    const state = (command: string): boolean => {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    };

    this.activeFormats = {
      bold: state('bold'),
      italic: state('italic'),
      underline: state('underline'),
      unorderedList: state('insertUnorderedList'),
      orderedList: state('insertOrderedList'),
      alignLeft: state('justifyLeft'),
      alignCenter: state('justifyCenter'),
      alignRight: state('justifyRight'),
      alignJustify: state('justifyFull')
    };
  }

  private afterCommand(): void {
    this.saveSelection();
    this.refreshState();
    this.onChange(this.editorRef.nativeElement.innerHTML);
  }

  private saveSelection(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const anchor = selection.anchorNode;
    if (anchor && this.editorRef.nativeElement.contains(anchor)) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  private restoreSelection(): void {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    if (this.savedRange && this.editorRef.nativeElement.contains(this.savedRange.startContainer)) {
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
      return;
    }

    this.focusEditorEnd();
  }

  private closestBlock(): HTMLElement | null {
    return this.closestMatchingNode(/^(P|DIV|LI|H[1-6]|TD|TH|BLOCKQUOTE|PRE)$/);
  }

  private closestMatchingNode(tagPattern: RegExp): HTMLElement | null {
    const selection = window.getSelection();
    const editor = this.editorRef.nativeElement;
    let node: Node | null = selection?.anchorNode ?? null;

    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (tagPattern.test(element.tagName)) {
          return element;
        }
      }
      node = node.parentNode;
    }

    return null;
  }

  private currentCell(): HTMLTableCellElement | null {
    return this.closestMatchingNode(/^(TD|TH)$/) as HTMLTableCellElement | null;
  }

  private currentRow(): HTMLTableRowElement | null {
    const cell = this.currentCell();
    return cell ? (cell.parentElement as HTMLTableRowElement) : null;
  }

  private focusCell(cell: HTMLTableCellElement | undefined): void {
    if (!cell) {
      this.focusEditorEnd();
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    this.editorRef.nativeElement.focus();
  }

  private focusEditorEnd(): void {
    const editor = this.editorRef.nativeElement;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    editor.focus();
  }

  private insertTableNode(rows: number, cols: number): void {
    const editor = this.editorRef.nativeElement;
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const row = document.createElement('tr');
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        const cell = document.createElement('td');
        cell.appendChild(document.createElement('br'));
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }

    table.appendChild(tbody);

    const cell = this.currentCell();
    if (cell) {
      const outerTable = cell.closest('table');
      if (outerTable?.parentElement) {
        outerTable.parentElement.insertBefore(table, outerTable.nextSibling);
      } else {
        editor.appendChild(table);
      }
    } else {
      const block = this.closestBlock();
      if (block && block !== editor && block.parentElement) {
        block.parentElement.insertBefore(table, block.nextSibling);
      } else {
        editor.appendChild(table);
      }
    }

    const trailingParagraph = document.createElement('p');
    trailingParagraph.appendChild(document.createElement('br'));
    table.parentElement?.insertBefore(trailingParagraph, table.nextSibling);

    const firstCell = table.querySelector('td') as HTMLTableCellElement | null;
    if (firstCell) {
      this.focusCell(firstCell);
    } else {
      this.focusEditorEnd();
    }
  }
}
