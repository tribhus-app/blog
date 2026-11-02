'use client';

/* No blog o visor só mostra as fotos do artigo, que não são post da Tribhus:
   nenhuma foto leva `postId`, então a conversa do visor nunca aparece e estas
   funções não são chamadas. Ficam para o Visor compilar igual ao do site. */

export interface ComentarioDoVisor {
  id: number | string;
  autor: { nome: string; href?: string | null; fotoUrl?: string | null };
  texto: string;
}

export async function comentariosDoPost(postId: number): Promise<ComentarioDoVisor[]> {
  void postId;
  return [];
}

export async function comentarNoPost(postId: number, texto: string): Promise<ComentarioDoVisor | null> {
  void postId; void texto;
  return null;
}

export function pedirLoginNoVisor() {
  window.location.href = 'https://tribhus.com/login';
}
