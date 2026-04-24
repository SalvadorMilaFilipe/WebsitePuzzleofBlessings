import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BlessingAvatar from './BlessingAvatar'
import '../css/deck.css'

export default function DeckModal({ isOpen, onClose, userId }) {
    const [allBlessings, setAllBlessings] = useState([])
    const [deckSlots, setDeckSlots] = useState([null, null, null, null]) // Slots 1, 2, 3, 4
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen && userId) fetchData()
    }, [isOpen, userId])

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
                id: `${item.pl_id}-${item.bl_id}` // Composite ID for React keys
            }))
            
            setAllBlessings(processedData)

            // Fill slots based on deck_slot (1-4)
            const initialSlots = [null, null, null, null]
            processedData.forEach(item => {
                if (item.is_in_deck && item.deck_slot >= 1 && item.deck_slot <= 4) {
                    initialSlots[item.deck_slot - 1] = item
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
            const updates = deckSlots
                .filter(slot => slot !== null)
                .map((slot, index) => ({
                    bl_id: slot.bl_id,
                    is_in_deck: true,
                    deck_slot: index + 1
                }))

            for (const up of updates) {
                await supabase
                    .from('player_blessing')
                    .update({ is_in_deck: true, deck_slot: up.deck_slot })
                    .eq('pl_id', userId)
                    .eq('bl_id', up.bl_id)
            }

            alert("Deck Saved successfully!")
            onClose()
        } catch (err) {
            console.error("Error saving deck:", err)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    const inventory = allBlessings.filter(b => !deckSlots.find(s => s?.bl_id === b.bl_id))

    return (
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
                            <div key={i} className={`deck-slot ${!slot ? 'empty' : ''}`} onClick={() => slot && toggleBlessing(slot)}>
                                {slot ? (
                                    <div className="slot-filled">
                                        <BlessingAvatar blessing={slot.blessing} className="slot-avatar" />
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
                            <div key={item.id} className="inventory-item" onClick={() => toggleBlessing(item)}>
                                <BlessingAvatar blessing={item.blessing} className="inventory-avatar" />
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
        </div>
    )
}
