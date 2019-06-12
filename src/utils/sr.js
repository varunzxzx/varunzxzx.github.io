import ScrollReveal from 'scrollreveal';

export const isSSR = typeof window === 'undefined';
const sr = isSSR ? null : ScrollReveal();

export default sr;
