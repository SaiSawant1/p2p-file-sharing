// Each individual connection will be a client.
// Client struct stores the information about the client.
// will have the client
package client

import "github.com/gorilla/websocket"

type Client struct {
	Conn     *websocket.Conn
	Send     chan []byte
	IsSender bool
}

type Message struct {
	Type      string `json:"type"`
	SessionID string `json:"sessionId"`
	SDP       string `json:"sdp,omitempty"`
	Candidate string `json:"candidate,omitempty"`
}
