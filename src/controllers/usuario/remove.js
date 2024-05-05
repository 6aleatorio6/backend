import createController from '../../helpers/createController.js';
import prisma from '../../prisma.js';

/**
 *  Endpoint da tela de configurações
 *
 *  tipo: DELETE
 *  autenticação: somente USER
 *
 *  Criado para ser usado no:
 *      APP MOBILE
 */
export default createController(async (req, res) => {
  const id = +req.user.id;

  const usuario = await prisma.usuario.delete({
    select: {
      id: true,
      apelido: true,
      nome: true,
    },
    where: {
      id,
    },
  });

  res.json({ message: `Usuário ${id} removido`, usuario });
});
