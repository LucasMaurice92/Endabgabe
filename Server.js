"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
var Endabgabe;
(function (Endabgabe) {
    let scoreboard;
    let port = process.env.PORT;
    if (port == undefined) {
        port = 5001;
    }
    let databaseUrl = "mongodb+srv://mo:mo123@eiatest-8zhhe.mongodb.net/test?retryWrites=true&w=majority";
    connectToDatabase(databaseUrl);
    startServer(port);
    function startServer(_port) {
        let server = Http.createServer();
        console.log("Server starting on port:" + _port);
        server.listen(_port);
        server.addListener("request", handleRequest);
    }
    function connectToDatabase(_url) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = { useNewUrlParser: true };
            let mongoClient = new Mongo.MongoClient(_url, options);
            yield mongoClient.connect();
            scoreboard = mongoClient.db("EIAE08").collection("scoreboard");
            console.log("Connected to database");
        });
    }
    function handleRequest(_request, _response) {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        if (_request.url.startsWith("/store")) {
            storeData(_request, _response);
            return;
        }
        if (_request.url.startsWith("/get")) {
            getData(_request, _response);
            return;
        }
    }
    function storeData(_request, _response) {
        let url = Url.parse(_request.url, true);
        let query = url.query;
        if (query.name != null && query.score != null) {
            // Speicher in Datenbank
            let score = {
                name: query.name,
                points: parseInt(query.score)
            };
            console.log("store", score);
            storeScore(score);
        }
        _response.end();
    }
    function getData(_request, _response) {
        scoreboard.find({}, {
            limit: 10,
            sort: {
                points: -1
            }
        }).toArray((_err, docs) => {
            let jsonString = JSON.stringify(docs);
            _response.write(jsonString);
            _response.end();
        });
    }
    function storeScore(_score) {
        scoreboard.insert(_score);
    }
})(Endabgabe = exports.Endabgabe || (exports.Endabgabe = {}));
//# sourceMappingURL=Server.js.map