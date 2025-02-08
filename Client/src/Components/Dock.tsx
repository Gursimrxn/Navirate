export const Dock = () => {
    const dockItems = [
        {
            name: 'Popular Places',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26ZM12.0006 15.968L16.2473 18.3451L15.2988 13.5717L18.8719 10.2674L14.039 9.69434L12.0006 5.27502L9.96214 9.69434L5.12921 10.2674L8.70231 13.5717L7.75383 18.3451L12.0006 15.968Z" fill="black" fill-opacity="0.7"/>
            </svg>
        },
        {
            name: 'Choose Destination',
            icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0L12.001 3.06201C15.6192 3.51365 18.4869 6.38163 18.9381 10H22V12L18.938 12.001C18.4864 15.6189 15.6189 18.4864 12.001 18.938L12 22H10V18.9381C6.38163 18.4869 3.51365 15.6192 3.06201 12.001L0 12V10H3.06189C3.51312 6.38129 6.38129 3.51312 10 3.06189V0H12ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5ZM11 9C12.1046 9 13 9.8954 13 11C13 12.1046 12.1046 13 11 13C9.8954 13 9 12.1046 9 11C9 9.8954 9.8954 9 11 9Z" fill="white"/>
            </svg>            
        },
        {
            name: 'Settings',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="black" fill-opacity="0.7"/>
            </svg>            
        }
    ]
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '10px' }}>
            <button style={{ backgroundColor: 'transparent', border: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {dockItems[0].icon}
                    <span>{dockItems[0].name}</span>
                </div>
            </button>
            <button style={{
                backgroundColor: 'green',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {dockItems[1].icon}
                    <span style={{ color: 'white' }}>{dockItems[1].name}</span>
                </div>
            </button>
            {/* Right Button */}
            <button style={{ backgroundColor: 'transparent', border: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {dockItems[2].icon}
                    <span>{dockItems[2].name}</span>
                </div>
            </button>
        </div>
    )
}