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

    fileToBase64(file: File): Observable<string> {
        const result = new Subject<string>();
        let reader =new FileReader();
        //reader.readAsBinaryString(file);
        //console.log(reader);
        // reader.onload = (event) => {
        //     console.log(event);
        //     if (event.target?.result) {
        //         result.next(btoa(event.target.result.toString()))
        //     }
        // };
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '');
            if ((encoded!.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded!.length % 4));
            }
            result.next(encoded!);
        };
        reader.onerror=(e)=> {
            result.error(e!);
        };
        
        return result;
    }

    uploadFiles(file: any): Observable<Documento> {
        const documentsSubject = new Subject<Documento>();
        const documents$ = documentsSubject.asObservable();

        let documentos: Documento;

        //console.log("file", file);
        this.fileToBase64(file.file).subscribe({
            next:(base64) => {
                //console.log(base64);
                const sendFileData = [{
                    IdTipoDocumento: file.IdDocumento,
                    nombre: file.nombre,
                    metadatos: file.metadatos ? file.metadatos : {},
                    descripcion: file.descripcion ? file.descripcion : "",
                    file: base64
                }]
                //console.log("sendFileData", sendFileData);
    
                this.request.post(environment.GESTOR_DOCUMENTAL_MID, '/document/upload', sendFileData)
                    .subscribe((dataResponse) => {
                        documentos = dataResponse;
                        documentsSubject.next(documentos);
                    })
            },
            error: (err)=> {
                //console.log(err);
                documentsSubject.error(err);
            }
        })

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
        this.request.get(environment.GESTOR_DOCUMENTAL_MID, '/document/' + uuid)
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
