// Hub will act like a central controlling unit that will keep track of all the sessions.
package hub

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/SaiSawant1/p2p/signaling/internal/client"
	"github.com/SaiSawant1/p2p/signaling/internal/session"
	"github.com/gorilla/websocket"
)

type Hub struct {
	sessions map[string]*session.Session
	mu       sync.Mutex
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var hub = Hub{
	sessions: make(map[string]*session.Session),
}

func ServerWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[ERROR]: %s \n", err)
		return
	}

	newClient := &client.Client{Conn: conn, Send: make(chan []byte, 1024)}
	defer conn.Close()

	for {
		var msg client.Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Read Error,[ERROR]: %s \n", err)
			break
		}
		log.Printf("%s", msg)
		go hub.handleMessage(newClient, msg)

	}
}

func (h *Hub) handleMessage(client *client.Client, msg client.Message) {
	h.mu.Lock()
	defer h.mu.Unlock()

	switch msg.Type {
	case "CREATE_SESSION":
		h.createSession(client)

	case "JOIN_SESSION":
		h.joinSession(client, msg)
	case "OFFER", "ANSWER", "ICE_CANDIDATE":
		h.forwardMessage(msg)
	}

}

func (h *Hub) createSession(c *client.Client) {
	sessionId := fmt.Sprintf("%d", len(h.sessions)+1)
	c.IsSender = true
	h.sessions[sessionId] = &session.Session{Sender: c, MessageQueue: []client.Message{}}
	response := client.Message{Type: "SESSION_CREATED", SessionID: sessionId}
	c.Conn.WriteJSON(response)
}

func (h *Hub) joinSession(c *client.Client, msg client.Message) {
	sessionId := msg.SessionID
	c.IsSender = false
	session, exists := h.sessions[sessionId]
	if !exists {
		c.Conn.WriteJSON(client.Message{Type: "ERROR", SessionID: sessionId})
		return
	}

	session.Reciever = c

	peerConnectedMessage := client.Message{Type: "PEER_CONNECTED", SessionID: sessionId}
	session.Sender.Conn.WriteJSON(peerConnectedMessage)
	session.Reciever.Conn.WriteJSON(peerConnectedMessage)

	for _, queuedMsg := range session.MessageQueue {
		c.Conn.WriteJSON(queuedMsg)
	}

	session.MessageQueue = nil

}

func (h *Hub) forwardMessage(msg client.Message) {
	sessionId := msg.SessionID
	session, exists := h.sessions[sessionId]
	if !exists {
		return
	}
	target := session.Reciever
	if msg.Type == "ANSWER" || msg.Type == "ICE_CANDIDATE" {
		target = session.Sender
	}
	if target == nil {
		session.MessageQueue = append(session.MessageQueue, msg)
	} else {
		target.Conn.WriteJSON(msg)
	}
}
