const $subTasksEditTable = document.querySelector('#subTasksEditTable')

if ($subTasksEditTable) {
    $subTasksEditTable.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const taskId = event.target.dataset.taskId
            const subTaskId = event.target.dataset.subTaskId
            // const csrf = event.target.dataset.csrf

            fetch(`/task/removeSubTask`, {
                method: 'delete',
                body: {
                    taskId,
                    subTaskId
                }
            })
            // headers: {
            //     'X-XSRF-TOKEN': csrf
            // }
            // }).then(res => res.json())
            //   .then(card => {
            //       if (card.courses.length) {
            //         const html = card.courses.map(c => {
            //             return `
            //             <tr>
            //                 <th>${c.title}</th>
            //                 <th>${c.count}</th>
            //                 <th>
            //                     <button class="btn btm-small js-remove" data-id="${c.id}">Удалить</button>
            //                 </th>
            //             </tr>
            //             `
            //         }).join('')
            //         $card.querySelector('tbody').innerHTML = html
            //         $card.querySelector('.price').textContent = toCurrency(card.price)
            //       } else {
            //         $card.innerHTML = '<p>Корзина пуста</p>'
            //       }
            //   })
            // }
        }
    })
}