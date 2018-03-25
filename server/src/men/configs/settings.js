require('dotenv').config({silent: true})

const baseLine = {
mongodb :{
    uri: 'mongodb://localhost/dev',
    options:{}
},
  app: {
    name: process.env.APP_NAME || 'MenStackJS'
  }
};

export function get(env) {
  return baseLine;
}

export function set(identifer, value) {
  baseLine[identifer] = value
  return baseLine
}