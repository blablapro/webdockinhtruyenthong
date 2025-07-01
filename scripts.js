async function napKinhVao(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Không tìm thấy vùng chứa với ID: ${containerId}`);
      return null; // Return null if container not found
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Lỗi khi tải file ${filePath}: ${response.statusText} (${response.status})`);
      }
      const htmlContent = await response.text();
      container.innerHTML = htmlContent;
      return container; // Return the container after loading content
    } catch (error) {
      console.error(`Không thể nạp kinh từ \"${filePath}\" vào \"#${containerId}\":`, error);
      container.innerHTML = `<p style=\"color: red; font-style: italic;\">Xin lỗi, không thể tải được nội dung kinh này vào lúc này.</p>`;
      return null; // Return null on error
    }
  }

document.addEventListener('DOMContentLoaded', async function() { // Made the function async
    // Hàm layoutChant đã được sửa đổi để nhận chiều rộng làm tham số
    var layoutChant = function(ctxt, score, chantContainer, containerWidth) {
        score.performLayoutAsync(ctxt, function() {
            score.layoutChantLines(ctxt, containerWidth, function() { // Sử dụng containerWidth ở đây
                chantContainer.innerHTML = score.createSvg(ctxt);
            });
        });
    };

    // Hàm displayChant vẫn giữ nguyên, nhưng sẽ gọi layoutChant với chiều rộng phù hợp
    var displayChant = function(ctxt, score, gabc, chantContainer, useDropCap, annotation, containerWidth) {
        ctxt.glyphScaling = 1.0 / 13.0;
        ctxt.staffInterval = ctxt.glyphPunctumWidth * ctxt.glyphScaling;
        ctxt.staffLineWeight = Math.round(ctxt.glyphPunctumWidth * ctxt.glyphScaling / 8);
        ctxt.neumeLineWeight = ctxt.staffLineWeight;
        ctxt.dividerLineWeight = ctxt.neumeLineWeight;
        ctxt.episemaLineWeight = ctxt.neumeLineWeight;
        ctxt.lyricTextFont = "\'Crimson Pro\',\'Adobe Garamond Pro\',\'Garamond\',\'Georgia\', serif";
        ctxt.staffInterval = 8;
        ctxt.lyricTextSize = 25;
        ctxt.dropCapTextSize = 87;
        ctxt.annotationTextSize = 20;
        ctxt.staffLineColor = "#A52A2A";
        ctxt.dropCapTextColor = "#A52A2A";
        ctxt.dropCapTextFont = "\'Crimson Pro\',\'Adobe Garamond Pro\',\'Garamond\',\'Georgia\', serif";
        ctxt.annotationTextFont = ctxt.lyricTextFont;
        var mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
        score = new exsurge.ChantScore(ctxt, mappings, useDropCap);
        if (annotation) {
            score.annotation = new exsurge.Annotation(ctxt, annotation);
        }
        layoutChant(ctxt, score, chantContainer, containerWidth); // Truyền containerWidth vào layoutChant
    };

    // Hàm mới để điều chỉnh chiều rộng và hiển thị thánh ca
    function adjustChantContainerWidth() {
        const allChantContainers = document.querySelectorAll('.chant-container, .multi-chant-container, .unit-chant-container');
        const screenWidth = window.innerWidth;

        let containerWidth;

        if (screenWidth <= 780) {
            containerWidth = screenWidth - 80;
             // Đảm bảo chiều rộng không âm
            if (containerWidth < 0) {
                containerWidth = 0;
            }
        } else {
            containerWidth = 700;
        }

        allChantContainers.forEach(chantContainer => {
            chantContainer.style.width = containerWidth + 'px';

            // Clear previous chant rendering
            if (chantContainer.classList.contains('chant-container')) {
                chantContainer.innerHTML = '';
            } else if (chantContainer.classList.contains('multi-chant-container')) {
                const gabcSegments = chantContainer.querySelectorAll('.gabc-segment');
                gabcSegments.forEach(segment => segment.innerHTML = '');
            } else if (chantContainer.classList.contains('unit-chant-container')) {
                const gabcSegments = chantContainer.querySelectorAll('.gabc-segment');
                gabcSegments.forEach(segment => segment.innerHTML = '');
            }

            if (chantContainer.classList.contains('chant-container')) {
                // Hiển thị lại thánh ca đơn với chiều rộng mới
                const gabcData = chantContainer.dataset.gabc;
                const annotationData = chantContainer.dataset.annotation;
                if (gabcData) {
                    let ctxt = new exsurge.ChantContext();
                    const useDropCap = chantContainer.dataset.dropcap !== 'false';
                    displayChant(ctxt, null, gabcData, chantContainer, useDropCap, annotationData, containerWidth); // Truyền containerWidth vào displayChant
                }
            } else if (chantContainer.classList.contains('multi-chant-container')) {
                // Hiển thị lại từng đoạn thánh ca trong multi-chant-container với chiều rộng mới
                const chantSegments = chantContainer.querySelectorAll('.gabc-segment');
                // Sử dụng chantContainer làm ngữ cảnh cho querySelectorAll
                chantSegments.forEach(segment => {
                    if (segment.classList.contains('gabc-segment')) {
                        const gabcData = segment.dataset.gabc;
                        const annotationData = segment.dataset.annotation;
                        if (gabcData) {
                            let ctxt = new exsurge.ChantContext();
                            const useDropCap = segment.dataset.dropcap !== 'false';
                            displayChant(ctxt, null, gabcData, segment, useDropCap, annotationData, containerWidth);
                        }
                    }
                });
            } else if (chantContainer.classList.contains('unit-chant-container')) {
                // Hiển thị lại từng đoạn thánh ca trong multi-chant-container với chiều rộng mới
                const chantSegments = chantContainer.querySelectorAll('.gabc-segment');
                // Sử dụng chantContainer làm ngữ cảnh cho querySelectorAll
                chantSegments.forEach(segment => {
                    if (segment.classList.contains('gabc-segment')) {
                        const gabcData = segment.dataset.gabc;
                        const annotationData = segment.dataset.annotation;
                        if (gabcData) {
                            let ctxt = new exsurge.ChantContext();
                            const useDropCap = segment.dataset.dropcap !== 'false';
                            displayChant(ctxt, null, gabcData, segment, useDropCap, annotationData, containerWidth);
                        }
                    }
                });
            }
        });
    }

    // Handle toggleable divs (prayers and chants)
    // Consolidated the two querySelectorAll calls into one
    const toggleableDivs = document.querySelectorAll('div.toggleable-prayer, div.toggleable-prayer-open, .chant-container, .multi-chant-container, .unit-chant-container');

    let chantCounter = 1;

    toggleableDivs.forEach(div => {
        const isChantContainer = div.classList.contains('chant-container') || div.classList.contains('multi-chant-container') || div.classList.contains('unit-chant-container');
        const titleData = div.dataset.title;
        const divId = div.id;

        // Create an h2 element
        const toggleButton = document.createElement('h2');
        toggleButton.classList.add('prayer-title');
        toggleButton.style.cursor = 'pointer';

        if (isChantContainer) {
            if (titleData) {
                toggleButton.textContent = `${chantCounter}. ${titleData}`;
                toggleButton.style.color = '#A52A2A'; // Set color for chant titles
                chantCounter++;
            }
        } else {
            toggleButton.textContent = divId.replace(/\d+/g, '').replace(" Hà Nội xưa", ''); // Remove all digits
        }

        // Insert the h2 before the div
        div.parentNode.insertBefore(toggleButton, div);

        // Initially set the display style based on the class
        div.style.display = 'none';

        toggleButton.addEventListener('click', function() {
            // Toggle the display style of the corresponding div
            if (div.style.display === 'none') {
                div.style.display = 'block';
            } else {
                div.style.display = 'none';
            }
        });
    });


    // ----------------------------------------------------------------------
    // PHẦN LOGIC CHÍNH - ĐÃ ĐƯỢC CẢI TIẾN
    // Thay vì hiển thị thánh ca ngay lập tức, chúng ta sẽ gọi adjustChantContainerWidth
    // để đảm bảo chiều rộng được tính toán và áp dụng trước khi layout
    // ----------------------------------------------------------------------

    // Load prayers first and then attach event listeners
    const prayerContainersToLoad = [
        { id: 'Các câu lạy', path: 'prayers/Các câu lạy.html' },
        { id: 'Câu than Fatima', path: 'prayers/Câu than Fatima.html' },
        { id: 'Kinh Ăn năn tội', path: 'prayers/Kinh Ăn năn tội.html' },
        { id: 'Kinh Cám ơn ban ngày', path: 'prayers/Kinh Cám ơn ban ngày.html' },
        { id: 'Kinh Cám ơn ban tối', path: 'prayers/Kinh Cám ơn ban tối.html' },
        { id: 'Kinh Cáo mình', path: 'prayers/Kinh Cáo mình.html' },
        { id: 'Kinh Cậy vì', path: 'prayers/Kinh Cậy vì.html' },
        { id: 'Kinh Cậy', path: 'prayers/Kinh Cậy.html' },
        { id: 'Kinh Dấu đơn', path: 'prayers/Kinh Dấu đơn.html' },
        { id: 'Kinh Dấu kép', path: 'prayers/Kinh Dấu kép.html' },
        { id: 'Kinh Vì dấu', path: 'prayers/Kinh Vì dấu.html' },
        { id: 'Kinh Kính mến', path: 'prayers/Kinh Kính mến.html' },
        { id: 'Kinh Kính mừng', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 1', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 2', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 3', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 4', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 5', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 6', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 7', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 8', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Kính mừng 9', path: 'prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Lạy Cha', path: 'prayers/Kinh Lạy Cha.html' },
        { id: 'Kinh Lạy Nữ Vương', path: 'prayers/Kinh Lạy Nữ Vương.html' },
        { id: 'Kinh Phó dâng', path: 'prayers/Kinh Phó dâng.html' },
        { id: 'Kinh Phù hộ', path: 'prayers/Kinh Phù hộ.html' },
        { id: 'Kinh Sáng danh', path: 'prayers/Kinh Sáng danh.html' },
        { id: 'Kinh Tin kính', path: 'prayers/Kinh Tin kính.html' },
        { id: 'Kinh Tin', path: 'prayers/Kinh Tin.html' },
        { id: 'Kinh Trông cậy', path: 'prayers/Kinh Trông cậy.html' },
        { id: 'Kinh Vì dấu', path: 'prayers/Kinh Vì dấu.html' },
        { id: 'Kinh Truyền tin', path: 'prayers/Kinh Truyền tin.html' },
        { id: 'Kinh Lạy Nữ Vương Thiên Đàng', path: 'prayers/Kinh Lạy Nữ Vương Thiên Đàng.html' },
        { id: 'Kinh Đức Chúa Thánh Thần', path: 'prayers/Kinh Đức Chúa Thánh Thần.html' },
        { id: 'Kinh Sấp mình', path: 'prayers/Kinh Sấp mình.html' },
        { id: 'Kinh Thờ lạy', path: 'prayers/Kinh Thờ lạy.html' },
        { id: 'Kinh Đội ơn', path: 'prayers/Kinh Đội ơn.html' },
        { id: 'Kinh Sáng soi', path: 'prayers/Kinh Sáng soi.html' },
        { id: 'Kinh Đức thánh Thiên thần', path: 'prayers/Kinh Đức thánh Thiên thần.html' },
        { id: 'Kinh Lạy Thánh Mẫu', path: 'prayers/Kinh Lạy Thánh Mẫu.html' },
        { id: 'Kinh Ông thánh Phanxicô cầu cho kẻ ngoại', path: 'prayers/Kinh Ông thánh Phanxicô cầu cho kẻ ngoại.html' },
        { id: 'Kinh Xét mình', path: 'prayers/Kinh Xét mình.html' },
        { id: 'Kinh Hãy nhớ', path: 'prayers/Kinh Hãy nhớ.html' },
        { id: 'Kinh Cầu ơn chết lành', path: 'prayers/Kinh Cầu ơn chết lành.html' },
        { id: 'Kinh Nghĩa đức tin', path: 'prayers/Kinh Nghĩa đức tin.html' },
        { id: 'Kinh Mười điều răn', path: 'prayers/Kinh Mười điều răn.html' },
        { id: 'Kinh Sáu điều răn', path: 'prayers/Kinh Sáu điều răn.html' },
        { id: 'Kinh Bảy phép Bí tích', path: 'prayers/Kinh Bảy phép Bí tích.html' },
        { id: 'Kinh Mười bốn mối', path: 'prayers/Kinh Mười bốn mối.html' },
        { id: 'Kinh Cải tội bảy mối', path: 'prayers/Kinh Cải tội bảy mối.html' },
        { id: 'Kinh Tám mối phúc thật', path: 'prayers/Kinh Tám mối phúc thật.html' },
        { id: 'Kinh Cầu Tên rất thánh Đức Chúa Giêsu', path: 'prayers/Kinh Cầu Tên rất thánh Đức Chúa Giêsu.html' },
        { id: 'Kinh Cầu Đức Bà', path: 'prayers/Kinh Cầu Đức Bà.html' },
        { id: 'Kinh Cầu Đức Bà 1', path: 'prayers/Kinh Cầu Đức Bà.html' },
        { id: 'Kinh Cầu Đức Bà 2', path: 'prayers/Kinh Cầu Đức Bà 2.html' },
        { id: 'Kinh Cầu chịu nạn', path: 'prayers/Kinh Cầu chịu nạn.html' },
        { id: 'Kinh Cầu ông thánh Giuse', path: 'prayers/Kinh Cầu ông thánh Giuse.html' },
        { id: 'Kinh Cầu rất thánh Trái Tim Đức Chúa Giêsu', path: 'prayers/Kinh Cầu rất thánh Trái Tim Đức Chúa Giêsu.html' },
        { id: 'Kinh Cầu các thánh', path: 'prayers/Kinh Cầu các thánh.html' },
        { id: 'Kinh Hãy nhớ', path: 'prayers/Kinh Hãy nhớ.html' },
        { id: 'Sáng khi thức dậy', path: 'prayers/Sáng khi thức dậy.html' },
        { id: 'Tối trước khi ngủ', path: 'prayers/Tối trước khi ngủ.html' },
        { id: 'Trước khi ăn', path: 'prayers/Trước khi ăn.html' },
        { id: 'Sau khi ăn', path: 'prayers/Sau khi ăn.html' },
        { id: 'Khi toan làm việc gì', path: 'prayers/Khi toan làm việc gì.html' },
        { id: 'Đang khi làm việc gì', path: 'prayers/Đang khi làm việc gì.html' },
        { id: 'Khi gặp sự khốn khó', path: 'prayers/Khi gặp sự khốn khó.html' },
        { id: 'Khi phải chước cám dỗ', path: 'prayers/Khi phải chước cám dỗ.html' },
        { id: 'Khi xem lễ', path: 'prayers/Khi xem lễ.html' },
        { id: 'Kinh Kính lạy Đức thánh Thiên thần', path: 'prayers/Kinh Kính lạy Đức thánh Thiên thần.html' },
        { id: 'Lời sau khi nguyện ngắm Hà Nội xưa', path: 'old-hanoi-prayers/Lời sau khi nguyện ngắm.html' },
        { id: 'Dấu Thánh giá Hà Nội xưa', path: 'old-hanoi-prayers/Dấu Thánh giá.html' },
        { id: 'Kinh Truyền tin Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Truyền tin.html' },
        { id: 'Kinh Đức Chúa Thánh Thần Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Đức Chúa Thánh Thần.html' },
        { id: 'Kinh Lạy Cha Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Lạy Cha.html' },
        { id: 'Kinh Kính mừng Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Kính mừng.html' },
        { id: 'Kinh Nhân đức tin Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Nhân đức tin.html' },
        { id: 'Kinh Trông cậy Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Trông cậy.html' },
        { id: 'Kinh Kính mến Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Kính mến.html' },
        { id: 'Kinh Ăn năn cáo mình Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Ăn năn cáo mình.html' },
        { id: 'Kinh Vâng lời Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Vâng lời.html' },
        { id: 'Kinh Kính dâng Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Kính dâng.html' },
        { id: 'Kinh Cầu nhân đức sạch sẽ Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Cầu nhân đức sạch sẽ.html' },
        { id: 'Kinh Cầu Đức Bà và các Thánh Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Cầu Đức Bà và các Thánh.html' },
        { id: 'Kinh Cám ơn Hà Nội xưa', path: 'old-hanoi-prayers/Kinh Cám ơn.html' },
        { id: 'Lời nguyện khi đọc kinh đoạn Hà Nội xưa', path: 'old-hanoi-prayers/Lời nguyện khi đọc kinh đoạn.html' },
        { id: 'Kinh Cầu ông thánh Phêrô', path: 'private-prayers/Kinh Cầu ông thánh Phêrô.html' },
        { id: 'Kinh tuần cửu nhật ông thánh Phêrô', path: 'private-prayers/Kinh tuần cửu nhật ông thánh Phêrô.html' },
    ];

    for (const prayerInfo of prayerContainersToLoad) {
        const loadedContainer = await napKinhVao(prayerInfo.id, prayerInfo.path);
        if (loadedContainer) {
            attachAudioListeners(loadedContainer); // Attach listeners to the loaded content
        }
    }

    // Select all elements with data-audio attributes initially present in the DOM
    const initialAudioElements = document.querySelectorAll('.gabc-segment, p[data-audio], span[data-audio]');
    attachAudioListenersToElements(initialAudioElements);


    // Function to attach audio listeners to a given container
    function attachAudioListeners(container) {
        const audioElements = container.querySelectorAll('.gabc-segment, p[data-audio],  span[data-audio]'); // Select the elements you want to be clickable for audio
        attachAudioListenersToElements(audioElements);
    }

    // Function to attach audio listeners to a NodeList of elements
    function attachAudioListenersToElements(elements) {
        const audioCache = {};
        let currentAudio = null; // Keep track of currently playing audio within this scope or a higher one if needed

        elements.forEach(element => {
            element.addEventListener('click', function(event) {
                event.stopPropagation();

                const audioPath = this.getAttribute('data-audio');

                // Ensure we stop any currently playing audio globally
                if (window.currentPlayingAudio) {
                    window.currentPlayingAudio.pause();
                    window.currentPlayingAudio.currentTime = 0;
                    window.currentPlayingAudio = null;
                }

                if (audioPath) {
                    let audio;
                    if (audioCache[audioPath]) {
                        audio = audioCache[audioPath];
                    } else {
                        audio = new Audio(audioPath);
                        audioCache[audioPath] = audio;

                        audio.addEventListener('ended', function() {
                            this.currentTime = 0;
                            if (window.currentPlayingAudio === this) {
                                window.currentPlayingAudio = null;
                            }
                        });

                         audio.addEventListener('play', function() {
                            // Update the global currentPlayingAudio
                            window.currentPlayingAudio = this;
                         });

                         audio.addEventListener('pause', function() {
                            if (window.currentPlayingAudio === this) {
                                window.currentPlayingAudio = null;
                            }
                         });
                    }

                    if (audio.paused) {
                        audio.play();
                    } else {
                        audio.pause();
                        audio.currentTime = 0;
                        window.currentPlayingAudio = null; // Update global state
                    }
                }
            });
        });
    }


    // Call adjustChantContainerWidth after all content is loaded
    adjustChantContainerWidth();

    // Call adjustChantContainerWidth on window resize
    window.addEventListener('resize', adjustChantContainerWidth);

    // Global click listener to stop audio when clicking outside
    document.addEventListener('click', function() {
        if (window.currentPlayingAudio) {
            window.currentPlayingAudio.pause();
            window.currentPlayingAudio.currentTime = 0;
            window.currentPlayingAudio = null;
        }
    });
});
