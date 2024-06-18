import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default async (req, res) => {
    const isPostgres = process.env.DB_TYPE === 'postgres';
    let total = null
    let genero = null
    const year = new Date().getFullYear();
    try {
        if (isPostgres) {
            const visitasTotal = await prisma.$queryRaw`
            SELECT
                TO_CHAR(dataDaVisita, 'YYYY-MM') AS monthYear,
                COUNT(*) as count
            FROM
                Visitas
            WHERE
                EXTRACT(YEAR FROM dataDaVisita) = ${year}
            GROUP BY
                TO_CHAR(dataDaVisita, 'YYYY-MM')
          `
            total = visitasTotal.map(visit => ({
                ...visit,
                count: Number(visit.count)
            }))
            const visitasGenero = await prisma.$queryRaw`
            SELECT
                TO_CHAR(v.dataDaVisita, 'YYYY-MM') AS monthYear,
                sexo,
                COUNT(*) as count
            FROM
                Visitas v
            JOIN Usuario u ON v.usuario_Id = u.id
            WHERE
                EXTRACT(YEAR FROM v.dataDaVisita) = ${year}
            GROUP BY
                TO_CHAR(v.dataDaVisita, 'YYYY-MM'), sexo`
            genero = visitasGenero.map(visit => ({
                ...visit,
                count: Number(visit.count)
            }))
        } else {
            const visitasTotal = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(dataDaVisita, '%Y-%m') AS monthYear,
                COUNT(*) as count
            FROM
                Visitas
            WHERE
                YEAR(dataDaVisita) = ${year}
            GROUP BY
                monthYear
          `
            total = visitasTotal.map(visit => ({
                ...visit,
                count: Number(visit.count)
            }))

            const visitasGenero = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(v.dataDaVisita, '%Y-%m') AS monthYear,
                sexo,
                COUNT(*) as count
            FROM
                Visitas v
            JOIN Usuario u ON v.usuario_Id = u.id
            WHERE
                YEAR(v.dataDaVisita) = ${year}
            GROUP BY
                monthYear, sexo
          `
            genero = visitasGenero.map(visit => ({
                ...visit,
                count: Number(visit.count)
            }))
        }
        const visitaMetodo = await prisma.visitas.findMany({
            select: {
                dataDaVisita: true,
                usuario: {
                    select: {
                        email: true,
                    }
                }
            },
            where: {
                dataDaVisita: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`)
                }
            }
        })
        const qrCode = visitaMetodo.filter(visitas => visitas.usuario.email !== null).length
        const toten = visitaMetodo.filter(visitas => visitas.usuario.email === null).length

        res.json({ total, genero, qrCode, toten })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Houve um erro no nosso servidor, tente novamente!', message: error })
    }
}