import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Login Rewards Data
const WEEKLY_REWARDS = [
  { name: 'Gold Dice', quantity: 50, item: 'dice' },
  { name: 'Gems', quantity: 10, item: 'gems' },
  { name: 'Experience', quantity: 100, item: 'XP' },
  { name: 'Rare Items', quantity: 2, item: 'items' },
  { name: 'Boosters', quantity: 5, item: 'boosters' },
  { name: 'Premium Dice', quantity: 25, item: 'premium dice' },
  { name: 'Special Reward', quantity: 1, item: 'special bonus' }
]

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function MainMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [collectedDays, setCollectedDays] = useState(() => {
    const stored = localStorage.getItem('dailyRewardsCollected')
    return stored ? JSON.parse(stored) : []
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
      setIsLoggedIn(loggedIn)
    }
    checkLogin()

    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const handleCollectReward = (dateStr) => {
    if (!collectedDays.includes(dateStr)) {
      const newCollected = [...collectedDays, dateStr]
      setCollectedDays(newCollected)
      localStorage.setItem('dailyRewardsCollected', JSON.stringify(newCollected))
    }
  }

  const getDailyRewardsData = () => {
    const today = new Date()
    const rewards = []

    // Generate 7 days: 3 days before, today, 3 days after
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dayIndex = date.getDay()
      const rewardIndex = (dayIndex + 7) % 7
      const reward = WEEKLY_REWARDS[rewardIndex]

      const dateStr = date.toDateString()
      const isCollected = collectedDays.includes(dateStr)
      const isPast = i < 0
      const isToday = i === 0
      const isFuture = i > 0

      let state = 'to-collect'
      if (isToday && isCollected) {
        state = 'collected'
      } else if (isToday && !isCollected) {
        state = 'collect-now'
      } else if (isPast && !isCollected) {
        state = 'not-collected'
      }

      rewards.push({
        date,
        dayOfWeek: DAYS_OF_WEEK[dayIndex],
        dayOfWeekShort: DAYS_OF_WEEK_SHORT[dayIndex],
        day: date.getDate(),
        month: MONTHS[date.getMonth()],
        reward: reward.name,
        quantity: reward.quantity,
        item: reward.item,
        isToday,
        isPast,
        isFuture,
        state,
        dateStr
      })
    }

    return rewards
  }

  const getExtendedCalendarData = () => {
    const today = new Date()
    // Reset time to midnight for accurate comparisons
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Determine the Monday of the "Previous Week"
    // today.getDay(): Sun=0, Mon=1...Sat=6
    // Monday based: Mon=0...Sun=6
    const currentDayOfWeek = today.getDay()
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1

    // Start of Current Week (Monday)
    const currentWeekStart = new Date(todayMidnight)
    currentWeekStart.setDate(todayMidnight.getDate() - daysFromMonday)

    // Start of Previous Week (Monday) - This is our Calendar Start
    const startDate = new Date(currentWeekStart)
    startDate.setDate(currentWeekStart.getDate() - 7)

    const calendarDays = []

    // Generate 3 weeks (21 days)
    for (let i = 0; i < 21; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dateStr = date.toDateString()
      const isCollected = collectedDays.includes(dateStr)
      const isToday = date.getTime() === todayMidnight.getTime()

      // Check if next month (future relative to current real time month)
      const dMonth = date.getMonth()
      const dYear = date.getFullYear()

      let isFutureMonth = false
      if (dYear > currentYear) {
        isFutureMonth = true
      } else if (dYear === currentYear && dMonth > currentMonth) {
        isFutureMonth = true
      }

      // Determine Reward
      const dayIndex = date.getDay()
      const rewardIndex = (dayIndex + 7) % 7
      const rewardConfig = WEEKLY_REWARDS[rewardIndex]

      // Determine State
      let state = 'future'

      if (isFutureMonth) {
        state = 'next-month-hidden'
      } else if (isToday && isCollected) {
        state = 'collected'
      } else if (isToday && !isCollected) {
        state = 'today'
      } else if (date < todayMidnight && !isCollected) {
        state = 'missed'
      } else if (isCollected) {
        state = 'collected'
      }

      // Is Last Day of Month?
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      const isLastDay = nextDay.getDate() === 1

      calendarDays.push({
        day: date.getDate(),
        dateStr,
        isCollected,
        isToday,
        isLastDay,
        reward: isFutureMonth ? '???' : rewardConfig.name,
        quantity: isFutureMonth ? '-' : rewardConfig.quantity,
        item: isFutureMonth ? '' : (rewardConfig.item || ''),
        state
      })
    }

    return calendarDays
  }

  const allDailyRewards = getDailyRewardsData()
  // For mobile: show 3 days (1 before, today, 1 after) instead of 7
  // Filter to show indices 2, 3, 4 (which are: -1, 0, +1 days)
  const dailyRewards = isMobile ? allDailyRewards.filter((_, index) => index >= 2 && index <= 4) : allDailyRewards
  const extendedCalendar = getExtendedCalendarData()

  return (
    <main className="main-menu" style={{ paddingTop: '100px' }}>
      <div className="container">
        {/* Top Section: Download Promo + Daily Rewards Side by Side */}
        <div className="main-hero-section">
          {/* Download Box - Left */}
          <div className="download-promo-box lowpoly-card">
            <div className="download-promo-content">
              <div className="download-icon">⬇️</div>
              <h2 className="download-promo-title">Don't have the game?</h2>
              <Link to="/download" className="btn btn-primary btn-download-promo">
                Install Now
              </Link>
            </div>
          </div>

          {/* Login Rewards - Right */}
          <section className="login-rewards-box lowpoly-card">
            <div className="login-rewards-header">
              <div className="login-rewards-title-section">
                <span className="rewards-icon">🎁</span>
                <h3 className="rewards-title">Login Rewards</h3>
              </div>
              <button
                className="calendar-btn"
                onClick={() => setShowCalendar(!showCalendar)}
                aria-label="Open calendar"
              >
                📅
              </button>
            </div>

            {/* 7 Days Rewards Display */}
            <div className="login-rewards-week">
              {dailyRewards.map((day, index) => (
                <div
                  key={index}
                  className={`login-reward-day ${day.isToday ? 'current-day' : ''} ${day.isPast ? 'past-day' : ''} ${day.isFuture ? 'future-day' : ''} ${day.state}`}
                >
                  <div className="reward-day-header">
                    <div className="reward-day-week">{day.dayOfWeekShort}</div>
                    <div className={`reward-day-date ${day.isToday ? 'current-date' : ''}`}>
                      {day.day}
                    </div>
                  </div>

                  <div className="reward-content">
                    <div className="reward-image">
                      {/* Space for reward item image */}
                    </div>
                    <div className="reward-name">{day.reward}</div>
                    <div className="reward-quantity">
                      {day.quantity}x {day.item}
                    </div>

                    {day.isToday && day.state === 'collect-now' && (
                      <button
                        className="btn-collect-reward"
                        onClick={() => handleCollectReward(day.dateStr)}
                      >
                        Collect
                      </button>
                    )}

                    {day.isToday && day.state === 'collected' && (
                      <div className="reward-status collected-status">✓ Collected</div>
                    )}

                    {day.state === 'not-collected' && (
                      <div className="reward-status not-collected-status">Not Collected</div>
                    )}

                    {day.state === 'to-collect' && (
                      <div className="reward-status to-collect-status">To Collect</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </section>
        </div>

        {/* Quick Access Section - Always visible, 1 click access */}
        <section className="quick-access-section">
          <h2 className="section-subtitle">Quick Access</h2>
          <div className="quick-access-grid">
            <Link to="/centro" className="quick-access-card featured-accent lowpoly-card">
              <div className="quick-icon">🏛️</div>
              <h3>The Center</h3>
              <p>Real-time game connection</p>
            </Link>
            <Link to="/wiki" className="quick-access-card lowpoly-card">
              <div className="quick-icon">📚</div>
              <h3>Wiki</h3>
              <p>Game guides & tips</p>
            </Link>
            <Link to="/forum" className="quick-access-card lowpoly-card">
              <div className="quick-icon">💬</div>
              <h3>Forum</h3>
              <p>Community discussions</p>
            </Link>
          </div>
        </section>

        {/* Main Content: Events & News - Mixed Grid */}
        <section className="content-section">
          <h2 className="section-subtitle">What's New</h2>
          <div className="content-grid">
            {/* Featured News - Takes 2 columns */}
            <article className="content-card news-card featured large-card lowpoly-card">
              <div className="content-badge news-badge">Latest</div>
              <div className="content-icon">📰</div>
              <h3 className="content-title">Major Update Coming Soon!</h3>
              <p className="content-description">
                We're working on exciting new features including multiplayer mode and
                expanded puzzle collections. Stay tuned for more information!
              </p>
              <div className="content-date">April 15, 2024</div>
            </article>

            {/* Event 1 */}
            <article className="content-card event-card lowpoly-card">
              <div className="content-badge event-badge">New</div>
              <div className="content-icon">🎉</div>
              <h3 className="content-title">Spring Puzzle Challenge</h3>
              <p className="content-description">
                Complete special spring-themed puzzles to earn exclusive rewards!
              </p>
              <div className="content-date">Ends: April 30, 2024</div>
            </article>

            {/* Event 2 */}
            <article className="content-card event-card lowpoly-card">
              <div className="content-badge event-badge">Ongoing</div>
              <div className="content-icon">🏆</div>
              <h3 className="content-title">Weekly Leaderboard</h3>
              <p className="content-description">
                Compete with other players and climb the leaderboard!
              </p>
              <div className="content-date">Resets every Monday</div>
            </article>

            {/* News 2 */}
            <article className="content-card news-card lowpoly-card">
              <div className="content-badge news-badge">News</div>
              <div className="content-icon">📰</div>
              <h3 className="content-title">New Puzzle Pack Released</h3>
              <p className="content-description">
                Explore 20 new challenging puzzles in our latest content update.
              </p>
              <div className="content-date">April 10, 2024</div>
            </article>

            {/* Event 3 */}
            <article className="content-card event-card lowpoly-card">
              <div className="content-badge event-badge">Coming Soon</div>
              <div className="content-icon">🎨</div>
              <h3 className="content-title">Community Puzzle Creation</h3>
              <p className="content-description">
                Create and share your own puzzles with the community!
              </p>
              <div className="content-date">Launching: May 2024</div>
            </article>

            {/* News 3 */}
            <article className="content-card news-card lowpoly-card">
              <div className="content-badge news-badge">News</div>
              <div className="content-icon">⭐</div>
              <h3 className="content-title">Community Spotlight</h3>
              <p className="content-description">
                Check out amazing puzzle solutions shared by our community members!
              </p>
              <div className="content-date">April 5, 2024</div>
            </article>
          </div>
        </section>
      </div>

      {/* Calendar Modal - Outside of all containers to appear on top */}
      {showCalendar && (
        <div className="calendar-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-header">
              <h3>{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</h3>
              <button
                className="calendar-close"
                onClick={() => setShowCalendar(false)}
                aria-label="Close calendar"
              >
                ×
              </button>
            </div>
            <div className="calendar-content">
              <div className="calendar-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={idx} className="calendar-weekday">{day}</div>
                ))}
                {extendedCalendar.map((day, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`calendar-day ${day.isToday ? 'today' : ''} ${day.state} ${day.isLastDay ? 'last-day-of-month' : ''}`}
                    >
                      <div className="calendar-day-header">
                        <span className="calendar-day-number">{day.day}</span>
                        {day.isCollected && <span className="calendar-check">✓</span>}
                        {day.isLastDay && <span className="calendar-golden-badge">⭐</span>}
                      </div>
                      <div className="calendar-reward-preview">
                        <div className="calendar-reward-icon">🎁</div>
                        <div className="calendar-reward-info">
                          <div className="calendar-reward-name" title={day.reward}>{day.reward}</div>
                          <div className="calendar-reward-quantity">{day.quantity}x {day.item || ''}</div>
                          <div className="calendar-reward-status">
                            {(day.state === 'collected' || (day.isToday && day.isCollected)) && <span className="status-badge collected-badge">✓ Collected</span>}
                            {day.state === 'today' && !day.isCollected && <span className="status-badge today-badge">Collect Now</span>}
                            {day.state === 'missed' && <span className="status-badge missed-badge">Missed</span>}
                            {day.state === 'future' && <span className="status-badge future-badge">To Collect</span>}
                            {day.state === 'next-month-hidden' && <span className="status-badge locked-badge">Locked</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default MainMenu
