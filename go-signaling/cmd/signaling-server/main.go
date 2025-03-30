package main

import (
	"log"
	"net/http"

	"github.com/SaiSawant1/p2p/signaling/internal/hub"
)

func main() {
	http.HandleFunc("/ws", hub.ServerWs)
	log.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Println("Error starting server:", err)
	}
}
