import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import BlessingAvatar from './BlessingAvatar'
import AdminBlessingAvatar from './AdminBlessingAvatar'
import '../css/deck.css'

export default function DeckModal({ isOpen, onClose, userId }) {
    const [allBlessings, setAllBlessings] = useState([])
    const [deckSlots, setDeckSlots] = useState([null, null, null, null]) // Slots 1, 2, 3, 4
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen && userId) fetchData()
    }, [isOpen, userId])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Updated query: Removed non-existent pb_id. pl_id and bl_id are the composite keys.
            // Using blessing(*) and category(*) to ensure correct data retrieval.
            const { data, error } = await supabase
                .from('player_blessing')
                .select(`
                    pl_id, 
                    bl_id, 
                    is_in_deck, 
                    deck_slot, 
                    blessing:bl_id (
                        *,
                        category:bl_category_id ( cat_name )
                    )
                `)
                .eq('pl_id', userId)

            if (error) {
                console.error("Supabase error:", error)
                throw error
            }

            const pbData = data || []
            // Create a unique front-end ID if needed, but bl_id is unique per player
            const processedData = pbData.map(item => ({
                ...item,
                id: `${item.pl_id}-${item.bl_id}`, // Composite ID for React keys
                blessing: {
                    ...item.blessing,
                   isAdminOnly: item.blessing?.bl_name?.toLowerCase().includes('admin') || item.blessing?.isAdminOnly
                }
            }))
            
            setAllBlessings(processedData)

            // Fill slots based on deck_slot mapping (game reads backwards): 
            // deck_slot 4 -> index 0 (Leftmost), 3 -> 1, 2 -> 2, 1 -> 3 (Rightmost)
            const initialSlots = [null, null, null, null]
            processedData.forEach(item => {
                if (item.is_in_deck && item.deck_slot >= 1 && item.deck_slot <= 4) {
                    initialSlots[4 - item.deck_slot] = item
                }
            })
            setDeckSlots(initialSlots)
        } catch (err) {
            console.error("Error fetching deck:", err)
        } finally {
            setLoading(false)
        }
    }

    const toggleBlessing = (pbItem) => {
        const slotIndex = deckSlots.findIndex(slot => slot?.bl_id === pbItem.bl_id)
        
        if (slotIndex !== -1) {
            // Remove from deck
            const newSlots = [...deckSlots]
            newSlots[slotIndex] = null
            setDeckSlots(newSlots)
        } else {
            // Add to first available slot
            const emptyIdx = deckSlots.indexOf(null)
            if (emptyIdx === -1) {
                alert("Deck is full! Remove a blessing first.")
                return
            }
            const newSlots = [...deckSlots]
            newSlots[emptyIdx] = pbItem
            setDeckSlots(newSlots)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // 1. Reset all as false first (for this user)
            await supabase
                .from('player_blessing')
                .update({ is_in_deck: false, deck_slot: null })
                .eq('pl_id', userId)

            // 2. Update the 4 chosen ones (Sequential updates using composite keys)
            // Game reads backwards, so index 0 = deck_slot 4, index 3 = deck_slot 1
            const updates = []
            deckSlots.forEach((slot, index) => {
                if (slot !== null) {
                    updates.push({
                        bl_id: slot.bl_id,
                        is_in_deck: true,
                        deck_slot: 4 - index
                    })
                }
            })

            for (const up of updates) {
                await supabase
                    .from('player_blessing')
                    .update({ is_in_deck: true, deck_slot: up.deck_slot })
                    .eq('pl_id', userId)
                    .eq('bl_id', up.bl_id)
            }

            // SIGNAL GAME: Send broadcast event so the game knows to refresh the deck
            await supabase.channel('deck_updates').send({
                type: 'broadcast',
                event: 'deck_changed',
                payload: { userId: userId, timestamp: new Date().toISOString() }
            })

            alert("Deck Saved successfully!")
            onClose()
        } catch (err) {
            console.error("Error saving deck:", err)
        } finally {
            setSaving(false)
        }
    }

    const onDragStart = (e, pbItem) => {
        e.dataTransfer.setData("pb_id", pbItem.bl_id);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onDrop = (e, targetIdx) => {
        e.preventDefault();
        const blId = e.dataTransfer.getData("pb_id");
        if (!blId) return;

        // Find the item in allBlessings
        const pbItem = allBlessings.find(b => b.bl_id === parseInt(blId) || b.bl_id === blId);
        if (!pbItem) return;

        const newSlots = [...deckSlots];
        
        // If it was already in another slot, remove it from there
        const prevIdx = newSlots.findIndex(s => s?.bl_id === pbItem.bl_id);
        if (prevIdx !== -1) newSlots[prevIdx] = null;

        // Place in target slot
        newSlots[targetIdx] = pbItem;
        setDeckSlots(newSlots);
    };

    if (!isOpen) return null

    const inventory = allBlessings.filter(b => !deckSlots.find(s => s?.bl_id === b.bl_id))

    return createPortal(
        <div className="deck-overlay" onClick={onClose}>
            <div className="deck-modal" onClick={e => e.stopPropagation()}>
                <header className="deck-header">
                    <h2>Blessings Deck</h2>
                    <p>Equip up to 4 blessings for your journey.</p>
                </header>

                <div className="deck-active-area">
                    <h3>Active Slots</h3>
                    <div className="deck-slots-grid">
                        {deckSlots.map((slot, i) => (
                            <div 
                                key={i} 
                                className={`deck-slot ${!slot ? 'empty' : ''}`} 
                                onClick={() => slot && toggleBlessing(slot)}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, i)}
                                data-slot={i + 1}
                            >
                                {slot ? (
                                    <div 
                                        className="slot-filled"
                                        draggable="true"
                                        onDragStart={(e) => onDragStart(e, slot)}
                                    >
                                        {slot.blessing?.isAdminOnly ? (
                                            <AdminBlessingAvatar blessing={slot.blessing} className="slot-avatar" />
                                        ) : (
                                            <BlessingAvatar blessing={slot.blessing} className="slot-avatar" />
                                        )}
                                        <span className="slot-name">{slot.blessing.bl_name}</span>
                                    </div>
                                ) : (
                                    <div className="slot-empty-icon">+</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="deck-inventory-area">
                    <h3>Your Collection</h3>
                    <div className="deck-inventory-grid">
                        {loading ? <div className="deck-loading">Loading...</div> : 
                          inventory.length > 0 ? inventory.map(item => (
                            <div 
                                key={item.id} 
                                className="inventory-item" 
                                onClick={() => toggleBlessing(item)}
                                draggable="true"
                                onDragStart={(e) => onDragStart(e, item)}
                            >
                                {item.blessing?.isAdminOnly ? (
                                    <AdminBlessingAvatar blessing={item.blessing} className="inventory-avatar" />
                                ) : (
                                    <BlessingAvatar blessing={item.blessing} className="inventory-avatar" />
                                )}
                                <small>{item.blessing.bl_name}</small>
                            </div>
                        )) : <div className="deck-empty">No unequipped blessings.</div>}
                    </div>
                </div>

                <footer className="deck-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Deck'}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    )
}
