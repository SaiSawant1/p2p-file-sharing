// Hub will act like a central controlling unit that will keep track of all the sessions.
package hub

import (
	"sync"

	"github.com/SaiSawant1/p2p/signaling/internal/session"
)

type Hub struct {
	sessions map[string]*session.Session
	mu       sync.Mutex
}
