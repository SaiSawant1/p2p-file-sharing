// Session will hold send and receiver conn to exchange information between them.
package session

import (
	"github.com/SaiSawant1/p2p/signaling/internal/client"
	"github.com/gorilla/websocket"
)

type Session struct {
	sender       *websocket.Conn
	reciever     *websocket.Conn
	messageQueue []client.Message
}
