let data = require('@begin/data')
let arc = require('@architect/functions')

let layout = body=> `<!doctype>
<html>
<link rel=stylesheet href=/styles/admin.css>
<body>${ body }</body>
</html>`

exports.handler = arc.http.async(unauthenticated, authenticated)

/** render the login form */
async function unauthenticated(req) {
  if (req.session.loggedIn) return
  else {
    let form = `<form action=/login method=post>
      <input type=password name=password>
    </form>`
    let html = layout(form)
    return { html }
  }
}

/** render the speaker list/form */
async function authenticated(req) {
  let speakerData = await data.get({ table: 'speakers', limit: 24 })
  let codeData = await data.get( {table: 'codes', limit: 1000 })
  let newSpeaker = speaker()
  let speakers =  speakerData.map(speaker).join('')
  let speakersSection = `<h2>Speakers</h2>${ newSpeaker + speakers }`
  let codesSection = `<h2>Redemption Codes</h2>${ codeData.map(code).join('') }`
  let html = layout(speakersSection + codesSection)
  return { html }
}

function code(c) {
  return `<details>
      <summary>${ c.key } ${ c.ticketRef }</summary>
      <form action=/code method=post>
        <input type=hidden name=key value="${ c.key }">
        <input type=text name=ticketRef value="${ c.ticketRef || '' }">
        <button>Save</button>
      </form>
    </details>`
}

function speaker(person) {
  return `<details>
  <summary>${ person ? person.name : 'new speaker' }</summary>
  <form action=/upsert method=post>
    <input type=${ person ? 'hidden' : 'text' } ${ person ? '' : 'placeholder=key' } name=key value="${ person ? person.key : '' }">
    <input type=text name=pixelated placeholder="pixelated hash value" value="${ person ? person.pixelated : ''}" required>
    <input type=text name=name placeholder="Name" value="${ person ? person.name : ''}" required>
    <input type=text name=location value="${ person ? person.location : '' }" placeholder="Location (eg. Los Angeles, CA)" required>
    <input type=text name=title value="${ person ? person.title : '' }" placeholder="Talk title" required>
    <input type=text name=reveal placeholder="2020-06-20T13:30:00-07:00" value="${ person ? person.reveal : '' }" required>
    <input type=text name=topics value="${ person && person.topics && person.topics.length > 0 ? person.topics.join(',') : '' }" placeholder="Topics (comma-delimited)" required>
    <input type=text name=pronouns value="${ person ? person.pronouns : '' }" placeholder="she/her" required>
    <input type=text name=twitter value="${ person ? person.twitter : ''}" placeholder="Twitter (no @ symbol)" required>
    <input type=text name=url value="${ person ? person.url  : ''}" placeholder="URL" required>
    <input type=text name=company value="${ person ? person.company  : ''}" placeholder="Company" required>
    <textarea name=abstract value="${ person ? person.abstract : '' }" placeholder="VB.NET and C# go on a date with Java and JavaScript …" required>${ person ? person.abstract : '' }</textarea>
    <button>Save</button>
  </form>
  <form action=/delete method=post>
  <input type=hidden name=key value="${ person ? person.key : '' }">
  <button>Delete</button>
  </form>
</details>`
}
