// Session will hold send and receiver conn to exchange information between them.
package session

import (
	"github.com/SaiSawant1/p2p/signaling/internal/client"
)

type Session struct {
	Sender       *client.Client
	Reciever     *client.Client
	MessageQueue []client.Message
}
