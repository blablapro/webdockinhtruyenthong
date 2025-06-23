
document.addEventListener('DOMContentLoaded', function () {
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
        ctxt.lyricTextFont = "'Crimson Pro','Adobe Garamond Pro','Garamond','Georgia', serif";
        ctxt.staffInterval = 8;
        ctxt.lyricTextSize = 25;
        ctxt.dropCapTextSize = 87;
        ctxt.annotationTextSize = 20;
        ctxt.staffLineColor = "#A52A2A";
        ctxt.dropCapTextColor = "#A52A2A";
        ctxt.dropCapTextFont = "'Crimson Pro','Adobe Garamond Pro','Garamond','Georgia', serif";
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
        const allChantContainers = document.querySelectorAll('.chant-container, .multi-chant-container');
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
            }
        });
    }

    // Handle toggleable divs (prayers and chants)
    // Consolidated the two querySelectorAll calls into one
    const toggleableDivs = document.querySelectorAll('div.toggleable-prayer, div.toggleable-prayer-open, .chant-container, .multi-chant-container');

    let chantCounter = 1;

    toggleableDivs.forEach(div => {
        const isChantContainer = div.classList.contains('chant-container') || div.classList.contains('multi-chant-container');
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

    // ---------------------------------------------------------------------------
    // PHẦN HIỂN THỊ THÁNH CA VÀ CÁC PHẦN TỬ KHÁC
    // để đảm bảo chiều rộng được tính toán và áp dụng trước khi layout
    // ----------------------------------------------------------------------

    // Gọi hàm điều chỉnh chiều rộng và hiển thị thánh ca khi DOMContentLoaded
    adjustChantContainerWidth();

    // Gọi hàm điều chỉnh chiều rộng khi cửa sổ được resize
    window.addEventListener('resize', adjustChantContainerWidth);

    let currentAudio = null; // Biến để theo dõi audio đang phát

    clickableElements.forEach(element => {
        element.addEventListener('click', function(event) {
            event.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài

            const audioPath = this.getAttribute('data-audio');

            if (audioPath) {
                let audio;
                if (audioCache[audioPath]) {
                    audio = audioCache[audioPath];
                } else {
                    audio = new Audio(audioPath);
                    audioCache[audioPath] = audio;

                    audio.addEventListener('ended', function() {
                        this.currentTime = 0;
                        // Khi audio kết thúc, đặt currentAudio về null nếu đây là audio đang phát
                        if (currentAudio === this) {
                            currentAudio = null;
                        }
                    });

                    audio.addEventListener('play', function() {
                        // Khi audio bắt đầu phát, cập nhật currentAudio
                        currentAudio = this;
                    });

                     audio.addEventListener('pause', function() {
                        // Khi audio dừng, đặt currentAudio về null nếu đây là audio đang phát
                        if (currentAudio === this) {
                            currentAudio = null;
                        }
                    });
                }

                if (currentAudio && currentAudio !== audio) {
                    // Nếu có audio khác đang phát, dừng nó lại
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                if (audio.paused) {
                    audio.play(); // Nếu audio của segment này đang dừng, phát nó
                } else {
                     // Nếu audio của segment này đang phát (tức là currentAudio === audio),
                     // click lần nữa sẽ dừng nó.
                    audio.pause();
                    audio.currentTime = 0;
                     // Cập nhật currentAudio sau khi dừng
                     currentAudio = null;
                }
            }
        });
    });

    // Lắng nghe sự kiện click trên toàn bộ document để dừng audio khi click ra ngoài
    document.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null; // Đặt currentAudio về null sau khi dừng
        }
    });
});

// Hàm nạp kinh vào các phần tử
async function napKinhVao(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Không tìm thấy vùng chứa với ID: ${containerId}`);
      return; // Thoát sớm nếu không tìm thấy container
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Lỗi khi tải file ${filePath}: ${response.statusText} (${response.status})`);
      }
      const htmlContent = await response.text();
      container.innerHTML = htmlContent;
    } catch (error) {
      console.error(`Không thể nạp kinh từ \"${filePath}\" vào \"#${containerId}\":`, error);
      // Hiển thị thông báo lỗi thân thiện hơn trong container
      container.innerHTML = `<p style=\"color: red; font-style: italic;\">Xin lỗi, không thể tải được nội dung kinh này vào lúc này.</p>`;
    }
  }

// Nạp nội dung các kinh vào các phần tử tương ứng (giữ nguyên các lệnh gọi hàm napKinhVao của bạn)
napKinhVao('Các câu lạy', 'prayers/Các câu lạy.html');
napKinhVao('Câu than Fatima', 'prayers/Câu than Fatima.html');
napKinhVao('Kinh Ăn năn tội', 'prayers/Kinh Ăn năn tội.html');
napKinhVao('Kinh Cám ơn ban ngày', 'prayers/Kinh Cám ơn ban ngày.html');
napKinhVao('Kinh Cám ơn ban tối', 'prayers/Kinh Cám ơn ban tối.html');
napKinhVao('Kinh Cáo mình', 'prayers/Kinh Cáo mình.html');
napKinhVao('Kinh Cậy vì', 'prayers/Kinh Cậy vì.html');
napKinhVao('Kinh Cậy', 'prayers/Kinh Cậy.html');
napKinhVao('Kinh Dấu đơn', 'prayers/Kinh Dấu đơn.html');
napKinhVao('Kinh Dấu kép', 'prayers/Kinh Dấu kép.html');
napKinhVao('Kinh Vì dấu', 'prayers/Kinh Vì dấu.html');
napKinhVao('Kinh Kính mến', 'prayers/Kinh Kính mến.html');
napKinhVao('Kinh Kính mừng', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 1', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 2', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 3', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 4', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 5', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 6', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 7', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 8', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Kính mừng 9', 'prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Lạy Cha', 'prayers/Kinh Lạy Cha.html');
napKinhVao('Kinh Lạy Nữ Vương', 'prayers/Kinh Lạy Nữ Vương.html');
napKinhVao('Kinh Phó dâng', 'prayers/Kinh Phó dâng.html');
napKinhVao('Kinh Phù hộ', 'prayers/Kinh Phù hộ.html');
napKinhVao('Kinh Sáng danh', 'prayers/Kinh Sáng danh.html');
napKinhVao('Kinh Tin kính', 'prayers/Kinh Tin kính.html');
napKinhVao('Kinh Tin', 'prayers/Kinh Tin.html');
napKinhVao('Kinh Trông cậy', 'prayers/Kinh Trông cậy.html');
napKinhVao('Kinh Vì dấu', 'prayers/Kinh Vì dấu.html');
napKinhVao('Kinh Truyền tin', 'prayers/Kinh Truyền tin.html');
napKinhVao('Kinh Lạy Nữ Vương Thiên Đàng', 'prayers/Kinh Lạy Nữ Vương Thiên Đàng.html');
napKinhVao('Kinh Đức Chúa Thánh Thần', 'prayers/Kinh Đức Chúa Thánh Thần.html');
napKinhVao('Kinh Sấp mình', 'prayers/Kinh Sấp mình.html');
napKinhVao('Kinh Thờ lạy', 'prayers/Kinh Thờ lạy.html');
napKinhVao('Kinh Đội ơn', 'prayers/Kinh Đội ơn.html');
napKinhVao('Kinh Sáng soi', 'prayers/Kinh Sáng soi.html');
napKinhVao('Kinh Đức thánh Thiên thần', 'prayers/Kinh Đức thánh Thiên thần.html');
napKinhVao('Kinh Lạy Thánh Mẫu', 'prayers/Kinh Lạy Thánh Mẫu.html');
napKinhVao('Kinh Ông thánh Phanxicô cầu cho kẻ ngoại', 'prayers/Kinh Ông thánh Phanxicô cầu cho kẻ ngoại.html');
napKinhVao('Kinh Xét mình', 'prayers/Kinh Xét mình.html');
napKinhVao('Kinh Hãy nhớ', 'prayers/Kinh Hãy nhớ.html');
napKinhVao('Kinh Cầu ơn chết lành', 'prayers/Kinh Cầu ơn chết lành.html');
napKinhVao('Kinh Nghĩa đức tin', 'prayers/Kinh Nghĩa đức tin.html');
napKinhVao('Kinh Mười điều răn', 'prayers/Kinh Mười điều răn.html');
napKinhVao('Kinh Sáu điều răn', 'prayers/Kinh Sáu điều răn.html');
napKinhVao('Kinh Bảy phép Bí tích', 'prayers/Kinh Bảy phép Bí tích.html');
napKinhVao('Kinh Mười bốn mối', 'prayers/Kinh Mười bốn mối.html');
napKinhVao('Kinh Cải tội bảy mối', 'prayers/Kinh Cải tội bảy mối.html');
napKinhVao('Kinh Tám mối phúc thật', 'prayers/Kinh Tám mối phúc thật.html');
napKinhVao('Kinh Cầu Tên rất thánh Đức Chúa Giêsu', 'prayers/Kinh Cầu Tên rất thánh Đức Chúa Giêsu.html');
napKinhVao('Kinh Cầu Đức Bà', 'prayers/Kinh Cầu Đức Bà.html');
napKinhVao('Kinh Cầu Đức Bà 1', 'prayers/Kinh Cầu Đức Bà.html');
napKinhVao('Kinh Cầu Đức Bà 2', 'prayers/Kinh Cầu Đức Bà 2.html');
napKinhVao('Kinh Cầu chịu nạn', 'prayers/Kinh Cầu chịu nạn.html');
napKinhVao('Kinh Cầu ông thánh Giuse', 'prayers/Kinh Cầu ông thánh Giuse.html');
napKinhVao('Kinh Cầu rất thánh Trái Tim Đức Chúa Giêsu', 'prayers/Kinh Cầu rất thánh Trái Tim Đức Chúa Giêsu.html');
napKinhVao('Kinh Cầu các thánh', 'prayers/Kinh Cầu các thánh.html');
napKinhVao('Kinh Hãy nhớ', 'prayers/Kinh Hãy nhớ.html');
napKinhVao('Sáng khi thức dậy', 'prayers/Sáng khi thức dậy.html');
napKinhVao('Tối trước khi ngủ', 'prayers/Tối trước khi ngủ.html');
napKinhVao('Trước khi ăn', 'prayers/Trước khi ăn.html');
napKinhVao('Sau khi ăn', 'prayers/Sau khi ăn.html');
napKinhVao('Khi toan làm việc gì', 'prayers/Khi toan làm việc gì.html');
napKinhVao('Đang khi làm việc gì', 'prayers/Đang khi làm việc gì.html');
napKinhVao('Khi gặp sự khốn khó', 'prayers/Khi gặp sự khốn khó.html');
napKinhVao('Khi phải chước cám dỗ', 'prayers/Khi phải chước cám dỗ.html');
napKinhVao('Khi xem lễ', 'prayers/Khi xem lễ.html');
napKinhVao('Kinh Kính lạy Đức thánh Thiên thần', 'prayers/Kinh Kính lạy Đức thánh Thiên thần.html');
napKinhVao('Lời sau khi nguyện ngắm Hà Nội xưa', 'old-hanoi-prayers/Lời sau khi nguyện ngắm.html');
napKinhVao('Dấu Thánh giá Hà Nội xưa', 'old-hanoi-prayers/Dấu Thánh giá.html');
napKinhVao('Kinh Truyền tin Hà Nội xưa', 'old-hanoi-prayers/Kinh Truyền tin.html');
napKinhVao('Kinh Đức Chúa Thánh Thần Hà Nội xưa', 'old-hanoi-prayers/Kinh Đức Chúa Thánh Thần.html');
napKinhVao('Kinh Lạy Cha Hà Nội xưa', 'old-hanoi-prayers/Kinh Lạy Cha.html');
napKinhVao('Kinh Kính mừng Hà Nội xưa', 'old-hanoi-prayers/Kinh Kính mừng.html');
napKinhVao('Kinh Nhân đức tin Hà Nội xưa', 'old-hanoi-prayers/Kinh Nhân đức tin.html');
napKinhVao('Kinh Trông cậy Hà Nội xưa', 'old-hanoi-prayers/Kinh Trông cậy.html');
napKinhVao('Kinh Kính mến Hà Nội xưa', 'old-hanoi-prayers/Kinh Kính mến.html');
napKinhVao('Kinh Ăn năn cáo mình Hà Nội xưa', 'old-hanoi-prayers/Kinh Ăn năn cáo mình.html');
napKinhVao('Kinh Vâng lời Hà Nội xưa', 'old-hanoi-prayers/Kinh Vâng lời.html');
napKinhVao('Kinh Kính dâng Hà Nội xưa', 'old-hanoi-prayers/Kinh Kính dâng.html');
napKinhVao('Kinh Cầu nhân đức sạch sẽ Hà Nội xưa', 'old-hanoi-prayers/Kinh Cầu nhân đức sạch sẽ.html');
napKinhVao('Kinh Cầu Đức Bà và các Thánh Hà Nội xưa', 'old-hanoi-prayers/Kinh Cầu Đức Bà và các Thánh.html');
napKinhVao('Kinh Cám ơn Hà Nội xưa', 'old-hanoi-prayers/Kinh Cám ơn.html');
napKinhVao('Lời nguyện khi đọc kinh đoạn Hà Nội xưa', 'old-hanoi-prayers/Lời nguyện khi đọc kinh đoạn.html');
napKinhVao('Kinh Cầu ông thánh Phêrô', 'private-prayers/Kinh Cầu ông thánh Phêrô.html');
napKinhVao('Kinh tuần cửu nhật ông thánh Phêrô', 'private-prayers/Kinh tuần cửu nhật ông thánh Phêrô.html');

