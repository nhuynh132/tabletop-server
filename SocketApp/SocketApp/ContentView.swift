//
//  ContentView.swift
//  SocketApp
//
//  Created by Nueton Huynh on 4/19/22.
//

import SwiftUI
import SocketIO

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config: [.log(true), .compress])
    
    @Published var messages = [String]()
    
    init() {
        let socket = manager.defaultSocket
        socket.on(clientEvent: .connect) { (data, ack) in
            print("Connected")
            socket.emit("NodeJS Server Port", "Hi Node.js server.")
        }
        
        socket.on("iOS Client Port") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
            let rawMessage = data["msg"] {
                DispatchQueue.main.async {
                    self?.messages.append(rawMessage)
                }
            }
        }
        
        socket.connect()
    }
    
    func sendModelData() {
        let socket = manager.defaultSocket
        socket.on("model-data") { data, ack in
            guard let dict = data[0] as? [String: Any] else {return}
            print(dict)
        }
    }
}

struct ContentView: View {
    @ObservedObject var service = Service()
    
    var body: some View {
        VStack {
            Text("Receive messages from Node.js: ")
                .font(.largeTitle)
            ForEach(service.messages, id: \.self) { msg in
                Text(msg).padding()
            }
            Spacer()
        }
    }
    
    func encodeFunc() {
        let city = City(name: "asdf", zip: 0, population: 0)
        
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        
        do {
            let jsonData = try encoder.encode(city)
            
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                print(jsonString)
            }
        } catch {
            print(error.localizedDescription)
        }
    }
    
    func decodeFunc() {
        let jsonString = ""
        
        if let jsonData = jsonString.data(using: .utf8) {
            let decoder = JSONDecoder()
            do {
                let city = try decoder.decode(City.self, from: jsonData)
                print(city)
            } catch {
                print(error.localizedDescription)
            }
        } else {
            
        }

    }
}

class City: Codable {
    let name: String
    let zip: Int
    let population: Int
    
    init(name: String, zip: Int, population: Int) {
        self.name = name
        self.zip = zip
        self.population = population
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
