// Hub will act like a central controlling unit that will keep track of all the sessions.
package hub

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

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
	
	// Set up ping/pong to keep connection alive
	conn.SetPingHandler(func(string) error {
		return conn.WriteMessage(websocket.PongMessage, nil)
	})

	// Set up pong handler
	conn.SetPongHandler(func(string) error {
		return nil
	})

	// Handle messages
	go func() {
		defer func() {
			hub.handleClientDisconnect(newClient)
			conn.Close()
		}()
		
		for {
			var msg client.Message
			err := conn.ReadJSON(&msg)
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("Client disconnected: %v", err)
				}
				break
			}
			hub.handleMessage(newClient, msg)
		}
	}()
}

func (h *Hub) handleMessage(client *client.Client, msg client.Message) {
	h.mu.Lock()
	defer h.mu.Unlock()

	log.Printf("Received message type: %s, session: %s, from client type: %v", 
		msg.Type, msg.SessionID, client.IsSender)

	switch msg.Type {
	case "PING":
		log.Printf("Received ping from client")
		return
	case "CREATE_SESSION":
		log.Printf("Creating new session")
		client.IsSender = true
		h.createSession(client)
	case "JOIN_SESSION":
		log.Printf("Joining session %s", msg.SessionID)
		client.IsSender = false
		h.joinSession(client, msg)
	case "OFFER", "ANSWER", "ICE_CANDIDATE":
		log.Printf("Forwarding %s message for session %s", msg.Type, msg.SessionID)
		h.forwardMessage(msg)
	case "ERROR":
		log.Printf("Error message received: %v", msg)
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

func (h *Hub) createSession(c *client.Client) {
	sessionId := fmt.Sprintf("%d", len(h.sessions)+1)
	h.sessions[sessionId] = &session.Session{
		Sender: c,
		MessageQueue: []client.Message{},
	}

	response := client.Message{
		Type:      client.MessageTypeSessionCreated,
		SessionID: sessionId,
	}
	
	if err := c.Conn.WriteJSON(response); err != nil {
		log.Printf("Error sending SESSION_CREATED: %v", err)
		return
	}
	
	log.Printf("Session %s created successfully", sessionId)
}

func (h *Hub) joinSession(c *client.Client, msg client.Message) {
	sessionId := msg.SessionID
	log.Printf("Joining session %s", sessionId)
	
	session, exists := h.sessions[sessionId]
	if !exists {
		log.Printf("Session %s not found", sessionId)
		c.Conn.WriteJSON(client.Message{
			Type:      client.MessageTypeError,
			SessionID: sessionId,
		})
		return
	}

	session.Reciever = c
	log.Printf("Receiver set for session %s", sessionId)

	// Send PEER_CONNECTED to both peers
	peerConnectedMessage := client.Message{
		Type:      client.MessageTypePeerConnected,
		SessionID: sessionId,
	}
	
	log.Printf("Sending PEER_CONNECTED to sender")
	if err := session.Sender.Conn.WriteJSON(peerConnectedMessage); err != nil {
		log.Printf("Error sending PEER_CONNECTED to sender: %v", err)
		return
	}
	
	log.Printf("Sending PEER_CONNECTED to receiver")
	if err := session.Reciever.Conn.WriteJSON(peerConnectedMessage); err != nil {
		log.Printf("Error sending PEER_CONNECTED to receiver: %v", err)
		return
	}

	// Forward any queued messages
	for _, queuedMsg := range session.MessageQueue {
		if err := c.Conn.WriteJSON(queuedMsg); err != nil {
			log.Printf("Error forwarding queued message: %v", err)
		}
	}

	session.MessageQueue = nil
}

func (h *Hub) forwardMessage(msg client.Message) {
	sessionId := msg.SessionID
	session, exists := h.sessions[sessionId]
	if !exists {
		log.Printf("Session not found: %s", sessionId)
		return
	}

	var target *client.Client
	if msg.Type == "OFFER" {
		target = session.Reciever
	} else if msg.Type == "ANSWER" || msg.Type == "ICE_CANDIDATE" {
		target = session.Sender
	}

	if target == nil {
		log.Printf("Target client not found for message type: %s", msg.Type)
		session.MessageQueue = append(session.MessageQueue, msg)
	} else {
		log.Printf("Forwarding %s to target", msg.Type)
		if err := target.Conn.WriteJSON(msg); err != nil {
			log.Printf("Error forwarding message: %v", err)
		}
	}
}

func (h *Hub) cleanupSession(sessionId string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	if session, exists := h.sessions[sessionId]; exists {
		if session.Sender != nil && session.Sender.Conn != nil {
			session.Sender.Conn.Close()
		}
		if session.Reciever != nil && session.Reciever.Conn != nil {
			session.Reciever.Conn.Close()
		}
		delete(h.sessions, sessionId)
		log.Printf("Session %s cleaned up", sessionId)
	}
}

func (h *Hub) handleClientDisconnect(client *client.Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Find and clean up any sessions where this client was involved
	for sessionId, session := range h.sessions {
		if session.Sender == client || session.Reciever == client {
			log.Printf("Cleaning up session %s due to client disconnect", sessionId)
			delete(h.sessions, sessionId)
		}
	}
}
