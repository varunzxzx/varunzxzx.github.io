module.exports = {
  siteTitle: 'Varun M(varunzxzx) | Web Developer',
  siteDescription:
    'I\'m a self taught web developer based in New Delhi, India specializing in building exceptional, high-quality websites and applications.',
  siteKeywords:
    'Varun M, Varun, varunzxzx, software engineer, front-end engineer, web developer, javascript, open source, react, express, nodejs, graphql, pwa',
  siteUrl: 'https://varunzxzx.github.io',
  siteLanguage: 'en_US',
  name: 'Varun M',
  location: 'New Delhi, India',
  email: 'varun995862@gmail.com',
  github: 'https://github.com/varunzxzx/',
  socialMedia: [
    {
      name: 'Github',
      url: 'https://github.com/varunzxzx/',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/varunzxzx/',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/varunzxzx',
    },
  ],

  navLinks: [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'About',
      url: '#about',
    },
    {
      name: 'Work',
      url: '#projects',
    },
    {
      name: 'Blog',
      url: '#blog',
    },
    {
      name: 'Contact',
      url: '#contact',
    },
  ],

  twitterHandle: '@varunzxzx',
  googleAnalyticsID: 'UA-76555433-2',

  navHeight: 100,

  greenColor: '#64ffda',
  navyColor: '#0a192f',
  darkNavyColor: '#020c1b',

  srConfig: (delay = 200) => ({
    origin: 'bottom',
    distance: '20px',
    duration: 500,
    delay,
    rotate: { x: 0, y: 0, z: 0 },
    opacity: 0,
    scale: 1,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    mobile: true,
    reset: false,
    useDelay: 'always',
    viewFactor: 0.25,
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
  }),
};
