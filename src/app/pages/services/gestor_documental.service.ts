import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Documento } from '../../@core/models/documento'
import { RequestManager } from './requestManager';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { BaseCdkCell } from '@angular/cdk/table';


@Injectable({
    providedIn: 'root',
})
export class GestorDocumentalService {
    constructor(
        private request: RequestManager,
        private sanitization: DomSanitizer
    ) {
    }

    getUrlFile(base64: string, minetype: string) {
        return new Promise<string>((resolve, reject) => {
            const url = `data:${minetype};base64,${base64}`;
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "File name", { type: minetype })
                    const url = URL.createObjectURL(file);
                    resolve(url);
                })
        });
    }

    async fileToBase64(file: Blob): Promise<string> {
        // Se evita FileReader a proposito: en standalone el web component OAS
        // carga su propio zone.js y FileReader queda doblemente parcheado,
        // provocando "Maximum call stack size exceeded" al leer el archivo.
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = '';
        const chunkSize = 0x2000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = Array.from(bytes.subarray(i, i + chunkSize));
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }

    uploadFiles(file: any): Observable<Documento> {
        const documentsSubject = new Subject<Documento>();
        const documents$ = documentsSubject.asObservable();

        (async () => {
            try {
                const sendFileData = [{
                    IdTipoDocumento: file.IdDocumento,
                    nombre: file.nombre,
                    metadatos: file.metadatos ? file.metadatos : {},
                    descripcion: file.descripcion ? file.descripcion : "",
                    file: await this.fileToBase64(file.file)
                }]

                this.request.post(environment.GESTOR_DOCUMENTAL_MID, '/document/upload', sendFileData)
                    .subscribe({
                        next: (dataResponse) => {
                            documentsSubject.next(dataResponse);
                        },
                        error: () => {
                            documentsSubject.error(new Error('error al cargar el documento'));
                        }
                    })
            } catch (error) {
                documentsSubject.error(error);
            }
        })();

        return documents$;
    }

    get(files: Documento[]) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();
        const documentos = files;
        let i = 0;
        files.map((file, index) => {
            this.request.get(environment.DOCUMENTO_SERVICE, 'documento/' + file.Id)
                .subscribe({
                    next: (doc) => {
                        this.request.get(environment.GESTOR_DOCUMENTAL_MID, '/document/' + doc.Enlace)
                            .subscribe({
                                next: async (f: any) => {
                                    const url = await this.getUrlFile(f.file, f['file:content']['mime-type'])
                                    documentos[index] = { ...documentos[index], ...{ url: url }, ...{ Documento: this.sanitization.bypassSecurityTrustUrl(url) } }
                                    i += 1;
                                    if (i === files.length) {
                                        documentsSubject.next(documentos);
                                    }
                                },
                                error: (e) => {
                                    documentsSubject.error(e);
                                },
                            })
                    },
                    error: (e) => {
                        documentsSubject.error(e);
                    },
                })
        });
        return documents$;
    }

    getByUUID(uuid: string) {
        const documentsSubject = new Subject<any>();
        const documents$ = documentsSubject.asObservable();
        let documento: any = null;
        this.request.get(environment.GESTOR_DOCUMENTAL_MID, 'document/' + uuid)
            .subscribe({
                next: async (f: any) => {
                    const url = await this.getUrlFile(f.file, f['file:content']['mime-type']);
                    documento = url
                    documentsSubject.next(documento);
                },
                error: (error) => {
                    documentsSubject.next(error);
                }
            })
        return documents$;
    }
}
