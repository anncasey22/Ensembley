import { useState } from 'react'

function Profile() {
  const [mediaList, setMediaList] = useState([]) // store multiple files
  const [bio, setBio] = useState('')
  const [submittedBio, setSubmittedBio] = useState(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const updatedMedia = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null,
      name: file.name,
    })).filter((item) => item.type !== null)

    setMediaList((prev) => [...prev, ...updatedMedia])
  }

  const handleBioSubmit = () => {
    setSubmittedBio(bio)
    setBio('')
  }

  return (
    <div className="app-container">
      <h1>Your Profile</h1>
      <p>Name: John Smith</p>
      <p>Age: 22</p>
      <p>Instrument: Piano</p>

      <p>Add bio:</p>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        cols={50}
        placeholder="Tell us about yourself..."
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <br />
      <button className="primary-button" onClick={handleBioSubmit}>Submit Bio</button>

      {submittedBio && (
        <div style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          <p><strong>Your Bio:</strong> {submittedBio}</p>
        </div>
      )}

      <p style={{ marginTop: '2rem' }}>Upload videos or images:</p>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      <div className="media-preview" style={{ marginTop: '2rem' }}>
        {mediaList.map((media, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold' }}>{media.name}</p>
            {media.type === 'image' && (
              <img
                src={media.url}
                alt={`Uploaded ${index}`}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            )}
            {media.type === 'video' && (
              <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
                <source src={media.url} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
