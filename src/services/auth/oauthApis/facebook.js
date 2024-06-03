import { HttpException } from '../../secureController/handlersPaia.js';
import { fetchPaiado, urlOauthCallback } from '../helpersAuth.js';

/* eslint-disable camelcase */
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FB_VERSION = process.env.FB_VERSION;

const urlBaseFbG = 'https://graph.facebook.com/' + FB_VERSION;
const urlBaseFbW = 'https://wwww.facebook.com/' + FB_VERSION;
const REDIRECT_URI = urlOauthCallback('facebook');

export function oauthFB(stateRedirect = '') {
  return {
    url: `${urlBaseFbW}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&state=${stateRedirect}&scope=email,public_profile`,
    async callback(code) {
      try {
        const { access_token } = await fetchPaiado(
          `${urlBaseFbG}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`,
        );

        const profile = await fetchPaiado(
          `${urlBaseFbG}/me?fields=id,name,short_name,picture&access_token=${access_token}`,
        );

        const foto = !profile.picture.data.is_silhouette
          ? profile.picture.data.url
          : undefined;

        return {
          facebookId: profile.id,
          apelido: profile.short_name || profile.name,
          foto,
        };
      } catch (error) {
        throw new HttpException(500, 'erro no oAuth2Client do facebook', error);
      }
    },
  };
}
