module.exports = () => {
  const Pedido = require("../../models/pedidoModel")();

  const controller = {
    listOrders: async (req: any, res: any) => {
      /** Retorna todos os pedidos */
      try {
        const pedidos = await Pedido.find({}, { _id: false });
        res.json(pedidos);
      } catch (err) {
        res.status(500).send(err);
      }
    },

    calcMonthRange: async (req: any, res: any) => {
      /** Calcula o resumo mensal para o range de meses solicitado */
      try {
        let filter: any = {
          data_hora: {
            gte: new Date(0),
            lt: new Date()
          }
        };

        const stringCheck = JSON.stringify(req.query);
        if (
          stringCheck !== "{}" &&
          stringCheck !== JSON.stringify({ start: "", end: "" })
        ) {
          if (req.query.start != "") {
            filter.data_hora.gte = new Date(req.query.start);
          }

          if (req.query.end != "") {
            let end = new Date(req.query.end);
            end = new Date(end.setMonth(end.getMonth() + 1));
            filter.data_hora.lt = end;
          }
        }

        let resultado = await Pedido.aggregate([
          { $match: {data_hora: {$gte: filter.data_hora.gte, $lt: filter.data_hora.lt} } },
          {
            $project: {
              _id: false,
              id_pedido: "$id_pedido",
              id_produto: "$id_produto",
              data_hora: {
                $dateToString: {
                  date: "$data_hora",
                  timezone: "-03:00",
                  format: "%d/%m/%Y %H:%M:%S"
                }
              },
              valor: "$valor",
              quantidade: "$quantidade",
              status: "$status"
            }
          }
        ]);

        res.json(resultado);
      } catch (err) {
        res.status(500).send(err);
      }
    }
  };

  return controller;
};
