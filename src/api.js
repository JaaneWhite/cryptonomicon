const API_KEY = "5f3d7cba0329c4fd884c1b66ff9167d40be7fdedd2cebda4a95a2e7e79187106";

const tickersHandlers = new Map;
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
        const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
        if (type !== AGGREGATE_INDEX || newPrice === undefined) {
                return
        }

        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));

        console.log(handlers);
})


function sendToWebSocket(message) {
        const stringifiedMessage = JSON.stringify(message);
        if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage);
        return;
        }
        socket.addEventListener('open', () => {
                socket.send(stringifiedMessage);
        }, {once: true})
}

function subscribeToTickerOnWs(ticker) {
        sendToWebSocket({
                "action": "SubAdd",
                subs: [`5~CCCAGG~${ticker}~USD`]
        });

}
function unSubscribeToTickerOnWs(ticker) {
        sendToWebSocket({
                "action": "SubRemove",
                subs: [`5~CCCAGG~${ticker}~USD`]
        });
}




export const subscribeToTicker = (ticker, cb) => {
        const subscribers = tickersHandlers.get(ticker) || [];
        tickersHandlers.set(ticker, [...subscribers, cb]);
        subscribeToTickerOnWs(ticker);
};
export const unSubscribeFromTicker = (ticker) => {
        tickersHandlers.delete(ticker);
        unSubscribeToTickerOnWs(ticker);
};

window.tickers = tickersHandlers;