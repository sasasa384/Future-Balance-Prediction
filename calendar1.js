const weeks = ['日', '月', '火', '水', '木', '金', '土']
const date = new Date()
let year = date.getFullYear()
let month = date.getMonth() + 1
const config = {
    show: 1,
}

function showCalendar(year, month) {
    for ( i = 0; i < config.show; i++) {
        const calendarHtml = createCalendar(year, month)
        const sec = document.createElement('section')
        sec.innerHTML = calendarHtml
        document.querySelector('#calendar').appendChild(sec)

        month++
        if (month > 12) {
            year++
            month = 1
        }
    }
}

function createCalendar(year, month) {
    const startDate = new Date(year, month - 1, 1) // 月の最初の日を取得
    const endDate = new Date(year, month,  0) // 月の最後の日を取得
    const endDayCount = endDate.getDate() // 月の末日
    const lastMonthEndDate = new Date(year, month - 1, 0) // 前月の最後の日の情報
    const lastMonthendDayCount = lastMonthEndDate.getDate() // 前月の末日
    const startDay = startDate.getDay() // 月の最初の日の曜日を取得
    let dayCount = 1 // 日にちのカウント
    let calendarHtml = '' // HTMLを組み立てる変数

    calendarHtml += '<h1>' + year  + '/' + month + '</h1>'
    calendarHtml += '<table>'
    calendarHtml += '<tr>'
    // 曜日の行を作成
    for (let i = 0; i < weeks.length; i++) {
        calendarHtml += '<th>' + weeks[i] + '</th>'
    }

    calendarHtml += '</tr>'

    for (let w = 0; w < 6; w++) {
        calendarHtml += '<tr>'

        for (let d = 0; d < 7; d++) {
            if (w == 0 && d < startDay) {
                // 1行目で1日の曜日の前
                let num = lastMonthendDayCount - startDay + d + 1
                calendarHtml += '<td class="is-disabled">' + num + '</td>'
            } else if (dayCount > endDayCount) {
                // 末尾の日数を超えた
                let num = dayCount - endDayCount
                calendarHtml += '<td class="is-disabled">' + num + '</td>'
                dayCount++
            } else {
                const today = new Date()
                const isToday = year === today.getFullYear()
                    && month === today.getMonth() + 1
                    && dayCount === today.getDate()

                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(dayCount).padStart(2,'0')}`

                const hasExpense = state.transactions.some(t => t.date === dateStr && t.type === 'expense')
                const hasIncome = state.transactions.some(t => t.date === dateStr && t.type === 'income')
                const hasShift = state.shifts.some(s => s.date === dateStr)

                const dots = `
                    ${hasExpense ? '<span class="dot dot-expense"></span>' : ''}
                    ${hasIncome ? '<span class="dot dot-income"></span>' : ''}
                    ${hasShift ? '<span class="dot dot-shift"></span>' : ''}
    `

                calendarHtml += `<td class="${isToday ? 'is-today' : ''}" onclick="selectDate('${dateStr}')" data-date="${dateStr}">
                    ${dayCount}
                    <div class="dots">${dots}</div>
                </td>`
            dayCount++
            }
        }
        calendarHtml += '</tr>'
    }
    calendarHtml += '</table>'

    return calendarHtml
}

function moveCalendar(e) {
    document.querySelector('#calendar').innerHTML = ''

    if (e.target.id === 'prev') {
        month--

        if (month < 1) {
            year--
            month = 12
        }
    }

    if (e.target.id === 'next') {
        month++

        if (month > 12) {
            year++
            month = 1
        }
    }

    showCalendar(year, month)
}

document.querySelector('#prev').addEventListener('click', moveCalendar)
document.querySelector('#next').addEventListener('click', moveCalendar)

showCalendar(year, month)

let selectedDate = null

function selectDate(dateStr) {
    if (selectedDate) {
        const prev = document.querySelector(`[data-date="${selectedDate}"]`)
        if (prev) prev.classList.remove('is-selected')
    }

    selectedDate = dateStr
    const current = document.querySelector(`[data-date="${dateStr}"]`)
    if (current) current.classList.add('is-selected')

    // 予測残高を計算
    const balance = getBalance(dateStr)

    // 画面に表示
    const today = new Date()
    const targetDate = new Date(dateStr)
    const label = dateStr > `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}` ? '予測残高' : '確定残高'

    document.getElementById('detail').style.display = 'block'
    document.getElementById('detail-date').textContent = dateStr
    document.getElementById('detail-balance').textContent = 
        label + '：' + (balance < 0 ? '-' : '') + '¥' + Math.abs(balance).toLocaleString()
}

function getBalance(targetDateStr) {
    if (!state.account) return 0

    const account = state.account
    const transactions = state.transactions

    const baseDate = new Date(account.date)
    const targetDate = new Date(targetDateStr)
    let balance = account.bank

    for (const tx of transactions) {
        const txDate = new Date(tx.date)
        if (txDate >= baseDate && txDate <= targetDate) {
            if (tx.type === 'income') {
                balance += tx.amount
            } else {
                balance -= tx.amount
            }
        }
    }

    return balance
}