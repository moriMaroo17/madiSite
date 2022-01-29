if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            
            fetch(`/card/remove/${id}`, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
              .then(card => {
                  if (card.courses.length) {
                    const html = card.courses.map(c => {
                        return `
                        <tr>
                            <th>${c.title}</th>
                            <th>${c.count}</th>
                            <th>
                                <button class="btn btm-small js-remove" data-id="${c.id}">Удалить</button>
                            </th>
                        </tr>
                        `
                    }).join('')
                    $card.querySelector('tbody').innerHTML = html
                    $card.querySelector('.price').textContent = toCurrency(card.price)
                  } else {
                    $card.innerHTML = '<p>Корзина пуста</p>'
                  }
              })
        }
    })
}