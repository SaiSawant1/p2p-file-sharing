package websocket

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[ERROR]: %s \n", err)
		return
	}

	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("[ERROR]: %s \n", err)
		}
		fmt.Printf("Message from client: %s \n", msg)
		if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Fatalf("Failed to write Message.[ERROR]: %s \n", err)
		}

	}
}
