const LCDClient = require("./src/utils/LCDClient");
const CEXClient = require("./src/utils/CEXClient");
const { accAddress } = require("./src/config");
let nIntervId;
async function Init() {
  nIntervId = setInterval(() => Deposit(), 1800);
}
async function Deposit() {
  try {
    await LCDClient.get(
      `/cosmos/tx/v1beta1/txs?events=transfer.recipient='${accAddress}'&pagination.offset=1&pagination.limit=100&order_by=ORDER_BY_DESC`
    ).then((response) => {
      //console.log(response.data.tx_responses);
      const data = response.data.tx_responses;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const txhash = element.txhash;
        const memo = element.tx.body.memo;
        const amount = element.tx.body.messages[0].amount[0].amount;
        const denom = element.tx.body.messages[0].amount[0].denom;
        //console.log("txhash:", txhash);

        const objBank = {
          txhash: txhash,
          memo: memo,
          amount: amount,
          denom: denom,
          wallet: accAddress,
        };

        try {
          CEXClient.post("/bank/deposit", objBank).then((response) => {
            console.log("memo:", memo);
            console.log("amount:", amount);
            console.log("denom:", denom);
            console.log("Success txhash:", txhash);
          });
        } catch (error) {
          console.log(
            "error -",
            error?.response?.data?.message,
            " - txhash: ",
            txhash
          );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

Init();
// terrad query bank balances terra1jqfayaetk4a3t6hz4r599szs54fa363thfemp9
// terrad tx bank send  terra1jqfayaetk4a3t6hz4r599szs54fa363thfemp9 terra1e0gnsneylaav9hf9lunt9lpsljh2j4dzw7vcqv 8600uluna --note=6542a889bba190c6a21392f1  --chain-id=localterra  --fees=22000uluna --broadcast-mode=block
