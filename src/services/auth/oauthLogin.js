import { ErrorController } from '../../helpers/erroController.js';
import { prismaPaiado } from '../customPrisma/prismaController.js';
import { jwtSign } from './helpersAuth.js';

export default async function loginOrSignUp(payload) {
  const idModel = Object.keys(payload).find((k) => k.includes('id'));

  if (!payload[idModel])
    throw new ErrorController('400', 'id do oauth não fornecido');

  let user = await prismaPaiado.usuario.findFirst({
    where: { [idModel]: payload[idModel] },
    select: { id: true },
  });

  if (!user)
    user = await prismaPaiado.usuario.create({
      simularUnique: ['email', idModel],
      data: payload,
      select: {
        id: true,
      },
    });

  return jwtSign({
    id: user.id,
    roles: 'USER',
  });
}
