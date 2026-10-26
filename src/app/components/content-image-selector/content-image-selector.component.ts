import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { GestorDocumentalService } from '../../pages/services/gestor_documental.service';

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const TARGET_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

@Component({
  selector: 'app-content-image-selector',
  templateUrl: './content-image-selector.component.html',
  styleUrls: ['./content-image-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentImageSelectorComponent),
      multi: true
    }
  ]
})
export class ContentImageSelectorComponent implements ControlValueAccessor {
  @Input() metadata: Record<string, unknown> = { origen: 'contenido_tematico' };

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imageId = '';
  previewUrl: string | null = null;
  uploading = false;
  loadingPreview = false;
  errorMessage = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly gestor: GestorDocumentalService) {}

  writeValue(value: string | null): void {
    this.imageId = value ?? '';
    this.errorMessage = '';

    if (!this.imageId) {
      this.previewUrl = null;
      return;
    }

    const requestedId = this.imageId;
    this.loadingPreview = true;
    this.gestor.getDocumentDataUrl(requestedId).subscribe({
      next: (url) => {
        if (requestedId !== this.imageId) {
          return;
        }
        this.previewUrl = url;
        this.loadingPreview = false;
      },
      error: () => {
        if (requestedId !== this.imageId) {
          return;
        }
        this.previewUrl = null;
        this.loadingPreview = false;
        this.errorMessage = 'No se pudo cargar la vista previa. El PDF mostrará un aviso hasta que se reintente.';
      }
    });
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

  selectFile(): void {
    if (!this.isDisabled && !this.uploading) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (file) {
      void this.upload(file);
    }
  }

  remove(): void {
    this.imageId = '';
    this.previewUrl = null;
    this.errorMessage = '';
    this.onChange('');
    this.onTouched();
  }

  private async upload(file: File): Promise<void> {
    this.uploading = true;
    this.errorMessage = '';

    try {
      const prepared = await this.prepareImage(file);
      const id = await firstValueFrom(this.gestor.uploadImage(prepared, this.metadata));
      this.imageId = id;
      this.previewUrl = await this.toPreviewUrl(prepared);
      this.onChange(id);
      this.onTouched();
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
      this.onTouched();
    } finally {
      this.uploading = false;
    }
  }

  private async prepareImage(file: File): Promise<File> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Formato no permitido. Use una imagen PNG o JPEG.');
    }
    if (file.size > MAX_INPUT_BYTES) {
      throw new Error('La imagen es demasiado grande (máximo 10 MB).');
    }

    const image = await this.loadImage(file);
    const needsResize = image.width > MAX_DIMENSION || image.height > MAX_DIMENSION;
    if (!needsResize && file.size <= TARGET_IMAGE_BYTES) {
      return file;
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No fue posible procesar la imagen.');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let blob: Blob | null = null;
    for (const quality of [0.85, 0.7, 0.6]) {
      blob = await this.toBlob(canvas, quality);
      if (blob.size <= TARGET_IMAGE_BYTES) {
        break;
      }
    }

    if (!blob) {
      throw new Error('No fue posible procesar la imagen.');
    }
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error('La imagen supera 2 MB incluso después de comprimirla.');
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No fue posible leer la imagen.'));
      };
      image.src = url;
    });
  }

  private toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No fue posible procesar la imagen.'))),
        'image/jpeg',
        quality
      );
    });
  }

  private async toPreviewUrl(file: File): Promise<string> {
    const base64 = await this.gestor.fileToBase64(file);
    return `data:${file.type};base64,${base64}`;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'No fue posible cargar la imagen. Intente nuevamente.';
  }
}
