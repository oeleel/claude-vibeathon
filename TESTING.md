# Testing Guide - Korean Kitchen Party

## ✅ Server Status

Both servers are running successfully:
- **Backend Server**: http://localhost:3001 ✓
- **Frontend Client**: http://localhost:5173 ✓

## 🧪 Testing Checklist

### Phase 1: Basic Connection
- [ ] Open http://localhost:5173 in your browser
- [ ] Verify home page loads with Korean Kitchen Party title
- [ ] Check that connection status shows "Connected to server"

### Phase 2: Room Creation & Lobby
- [ ] Click "Create Room" button
- [ ] Enter a player name
- [ ] Verify room is created and 4-character code appears
- [ ] Verify you appear in the player list with "Host" badge
- [ ] Copy room code to clipboard

### Phase 3: Multiplayer Join
- [ ] Open http://localhost:5173 in a **second browser window/incognito**
- [ ] Click "Join Room"
- [ ] Enter a different player name
- [ ] Paste the room code
- [ ] Verify second player joins successfully
- [ ] Check both players see each other in the lobby
- [ ] Second player clicks "Ready Up"
- [ ] Host should see "Ready" badge on second player

### Phase 4: Game Start
- [ ] Host clicks "Start Game" (should be enabled when 2+ ready)
- [ ] Verify both players transition to game screen
- [ ] Check game header shows: Room code, Round 1/10, Score 0, Lives ❤❤❤

### Phase 5: Gameplay Mechanics

#### Order Display
- [ ] Verify 2-3 Korean dish orders appear at top
- [ ] Each order shows Korean name (한글) and English name
- [ ] Required ingredients list is visible
- [ ] Timer countdown is working
- [ ] Timer changes color (green → yellow → red)

#### Player Inventory
- [ ] Each player has different ingredients
- [ ] Ingredients show emoji, Korean name, and English name
- [ ] Can see left/right neighbor names

#### Ingredient Passing
- [ ] Click an ingredient to select it (should highlight)
- [ ] Press `A` or `←` to pass left
- [ ] Verify ingredient disappears from sender
- [ ] Verify ingredient appears in receiver's inventory
- [ ] Try passing right with `D` or `→`
- [ ] Check notification appears for passing

#### Drag & Drop Assembly
- [ ] Drag an ingredient from inventory to work area plate
- [ ] Verify ingredient appears on plate
- [ ] Click ingredient on plate to remove it back to inventory
- [ ] Add multiple ingredients to plate

#### Dish Submission
- [ ] Select target dish from dropdown
- [ ] Add all required ingredients to plate
- [ ] Click "Submit Dish"
- [ ] Verify order completes successfully
- [ ] Check team score increases
- [ ] Notification shows completion with player name

#### Invalid Submissions
- [ ] Try submitting with wrong ingredients
- [ ] Should show error notification
- [ ] Ingredients remain on plate

#### Order Expiration
- [ ] Wait for an order timer to reach 0
- [ ] Verify order expires and disappears
- [ ] Check lives decrease by 1 (❤❤❤ → ❤❤)
- [ ] Notification shows order expired

### Phase 6: Round Progression
- [ ] Complete all orders in a round
- [ ] Verify "Round Complete" modal appears
- [ ] Shows team score and remaining lives
- [ ] Host clicks "Continue to Round 2"
- [ ] New round starts with new orders
- [ ] New ingredients distributed to players

### Phase 7: Game Over Conditions

#### Win Condition
- [ ] Complete 10 rounds with lives remaining
- [ ] "수고하셨습니다!" (Good work!) appears
- [ ] Final stats displayed
- [ ] Can return to home

#### Lose Condition
- [ ] Let 3 orders expire (lives reach 0)
- [ ] "Game Over" appears
- [ ] Final stats displayed

### Phase 8: Disconnection Handling
- [ ] Close one player's browser tab mid-game
- [ ] Other player should see disconnection
- [ ] Reopen browser and rejoin (if implemented)

### Phase 9: Multi-Player (3+ Players)
- [ ] Open 3-4 browser windows
- [ ] All join the same room
- [ ] Verify circular topology (each has left/right neighbors)
- [ ] Test passing ingredients in circle
- [ ] Verify collaboration works with more players

## 🐛 Known Issues to Check

1. **Timer Synchronization**: Do all players see the same time?
2. **Race Conditions**: Can multiple players submit the same order?
3. **Network Lag**: Is there noticeable delay in ingredient passing?
4. **State Consistency**: Do all players see the same game state?
5. **Browser Compatibility**: Test in Chrome, Firefox, Safari

## 📊 Performance Metrics

- [ ] Ingredient passing latency: < 200ms
- [ ] Order timer accuracy: ±1 second
- [ ] UI responsiveness: No stuttering
- [ ] Memory usage: Stable over time
- [ ] Multiple games: Can run multiple rooms simultaneously

## 🎮 User Experience Checks

- [ ] Instructions clear in lobby
- [ ] Korean cultural elements visible
- [ ] Emoji ingredients recognizable
- [ ] Buttons and controls intuitive
- [ ] Notifications helpful and timely
- [ ] Color scheme pleasing
- [ ] Layout works on different screen sizes

## 🔧 Technical Validation

- [ ] No console errors in browser
- [ ] WebSocket connection stable
- [ ] Server handles disconnections gracefully
- [ ] State updates broadcast correctly
- [ ] No memory leaks over extended play

## 📝 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________

Phase 1 (Connection): ☐ Pass ☐ Fail
Phase 2 (Lobby): ☐ Pass ☐ Fail
Phase 3 (Multiplayer): ☐ Pass ☐ Fail
Phase 4 (Game Start): ☐ Pass ☐ Fail
Phase 5 (Gameplay): ☐ Pass ☐ Fail
Phase 6 (Rounds): ☐ Pass ☐ Fail
Phase 7 (Game Over): ☐ Pass ☐ Fail
Phase 8 (Disconnection): ☐ Pass ☐ Fail
Phase 9 (3+ Players): ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
```

## 🚀 Quick Test Command

For automated quick check (requires curl):

```bash
# Check if server is responding
curl http://localhost:3001/health

# Should return: {"status":"ok","rooms":0}
```

## 🎯 Success Criteria

The game is working correctly if:
✅ Multiple players can join a room
✅ Game state synchronizes across all clients
✅ Ingredient passing works smoothly
✅ Orders can be completed successfully
✅ Timer countdown works correctly
✅ Lives decrease on expiration
✅ Rounds progress automatically
✅ Game over conditions trigger properly
✅ No critical errors in console
✅ Overall experience is fun and chaotic!

---

**Happy Testing! 화이팅!** 🎮🍜

