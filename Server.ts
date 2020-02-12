import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";
import {MongoError} from "mongodb";

export namespace Endabgabe {
    interface Score {
        name: string;
        points: number;
    }

    let scoreboard: Mongo.Collection;

    let port: number | string | undefined = process.env.PORT;
    if (port == undefined) {
        port = 5001;
    }

    let databaseUrl: string = "mongodb+srv://mo:mo123@eiatest-8zhhe.mongodb.net/test?retryWrites=true&w=majority";

    connectToDatabase(databaseUrl);
    startServer(port);

    function startServer(_port: number | string): void {
        let server: Http.Server = Http.createServer();
        console.log("Server starting on port:" + _port);

        server.listen(_port);
        server.addListener("request", handleRequest);
    }

    async function connectToDatabase(_url: string): Promise<void> {
        let options: Mongo.MongoClientOptions = {useNewUrlParser: true };
        let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();

        scoreboard = mongoClient.db("EIAE08").collection("scoreboard");

        console.log("Connected to database");
    }

    function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        if ((<string>_request.url).startsWith("/store")) {
            storeData(_request, _response);
            return;
        }

        if ((<string>_request.url).startsWith("/get")) {
            getData(_request, _response);
            return;
        }
    }

    function storeData(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        let url: Url.UrlWithParsedQuery = Url.parse(<string> _request.url, true);
        let query: any = url.query;

        if (query.name != null && query.score != null) {
            // Speicher in Datenbank
            let score: Score = {
                name: query.name as string,
                points: parseInt(query.score as string)
            };

            console.log("store", score);

            storeScore(score);
        }

        _response.end();
    }

    function getData(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        scoreboard.find({}, {
            limit: 10,
            sort: {
                points: -1
            }
        }).toArray((_err: MongoError, docs: any[]) => {
            let jsonString: string = JSON.stringify(docs);
            _response.write(jsonString);
            _response.end();
        });
   }

    function storeScore(_score: Score): void {
        scoreboard.insert(_score);
    }
}