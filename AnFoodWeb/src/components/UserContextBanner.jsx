import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegClock, FaSun, FaCloudRain, FaCloud, FaMoon } from 'react-icons/fa';

const UserContextBanner = () => {
    const [location, setLocation] = useState('Đang định vị...');
    const [weather, setWeather] = useState({ temp: '--', desc: 'Đang tải...', icon: <FaSun /> });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('');
    const [hasPermission, setHasPermission] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user.hoTen || user.HoTen)) {
            const fullName = user.hoTen || user.HoTen;
            const nameParts = fullName.trim().split(' ');
            setUserName(nameParts[nameParts.length - 1]); 
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setHasPermission(true);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
                        const geoData = await geoRes.json();
                        const city = geoData.address.city || geoData.address.town || geoData.address.state || "Vị trí của bạn";
                        setLocation(city);

                        const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                        const wxData = await wxRes.json();
                        const temp = Math.round(wxData.current_weather.temperature);
                        const code = wxData.current_weather.weathercode;
                        const isDay = wxData.current_weather.is_day;

                        let desc = "Trời quang";
                        let icon = isDay ? <FaSun color="#f39c12" /> : <FaMoon color="#f1c40f" />;

                        if (code >= 1 && code <= 3) { desc = "Có mây"; icon = <FaCloud color="#b2bec3" />; }
                        else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) { desc = "Có mưa"; icon = <FaCloudRain color="#0984e3" />; }
                        else if (code >= 95) { desc = "Mưa dông"; icon = <FaCloudRain color="#2d3436" />; }

                        setWeather({ temp, desc, icon });
                        setTimeout(() => setIsVisible(true), 100); 
                        localStorage.setItem('currentWeather', JSON.stringify({ temp: temp, code: code }));
                    } catch (error) {
                        setLocation("Không thể tải vị trí");
                    }
                },
                (error) => setHasPermission(false)
            );
        }

        return () => clearInterval(timer);
    }, []);

    if (!userName || !hasPermission) return null; 

    const hour = currentTime.getHours();
    let greeting = "Chào buổi sáng";
    if (hour >= 12 && hour < 18) greeting = "Chào buổi chiều";
    else if (hour >= 18) greeting = "Chào buổi tối";

    return (
        <div style={{ 
            width: '100%',
            background: '#f8f9fa', // Màu xám cực nhạt, không tranh spotlight
            borderBottom: '1px solid #f1f2f6',
            padding: '6px 0',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '0.85rem',
            color: '#636e72',
            transition: 'opacity 0.5s ease-in-out',
            opacity: isVisible ? 1 : 0
        }}>
            <div style={{ 
                maxWidth: '1200px', // Cho vừa với container của Header sếp
                margin: '0 auto', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0 20px'
            }}>
                {/* TRÁI: Lời chào */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                    <span style={{ color: '#e64a19' }}>✨</span>
                    {greeting}, <span style={{ color: '#e64a19' }}>{userName}</span>
                </div>

                {/* PHẢI: Cụm thông tin hệ thống */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaRegClock color="#b2bec3" />
                        <span style={{ fontWeight: '500' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div style={{ width: '1px', height: '12px', background: '#dfe6e9' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaMapMarkerAlt color="#b2bec3" />
                        <span style={{ fontWeight: '500' }}>{location}</span>
                    </div>

                    <div style={{ width: '1px', height: '12px', background: '#dfe6e9' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {weather.icon}
                        <span style={{ fontWeight: '600', color: '#2d3436' }}>{weather.temp}°C</span>
                        <span style={{ fontWeight: '500' }}>({weather.desc})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserContextBanner;   