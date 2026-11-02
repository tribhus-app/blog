/* O `inert` no React 18: os tipos já o conhecem como booleano, mas o React só
   passou a escrever `inert={true}` no HTML a partir do 19 (no 18 ele some, com
   aviso). Escrito como string vazia, sai. O pacote do redesenho é React 19. */
export const INERTE = { inert: '' } as unknown as { inert: boolean };
